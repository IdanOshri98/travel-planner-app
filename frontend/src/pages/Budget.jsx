import { useState, useEffect } from 'react';
import { DATA_MODE } from "../config";
import { loadExpenses, saveExpenses, getPayersSummary } from "../utils/expensesStorage";
import useExpenseStore from "../store/useExpenseStore";
import useToastStore from "../store/useToastStore";
import { fetchExpenses, createExpense, updateExpense, removeExpense, fetchPayersSummary } from "../services/expenseService";


export default function BudgetManagement({trip, onBack}) {

  const expenses = useExpenseStore(
    (state) => state.expensesByTrip[trip.id] || []
  );
  const setExpenses = useExpenseStore((state) => state.setExpenses);
  const addExpenseToStore = useExpenseStore((state) => state.addExpense);
  const updateExpenseInStore = useExpenseStore((state) => state.updateExpense);
  const deleteExpenseFromStore = useExpenseStore((state) => state.deleteExpense);
  const payers = useExpenseStore(
    (state) => state.payersByTrip[trip.id] || []
  );
  const setPayers = useExpenseStore((state) => state.setPayers);
  const addToast = useToastStore((state) => state.addToast);

  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false)
  const [showEndDate, setShowEndDate] = useState(false)
  const [editingExpenseId, setEditExpenseId] = useState(null)
  const [editFormData, setEditFormData] = useState({})


  useEffect(() => {
    if (!trip?.id) return;

    //DEMO
    if (DATA_MODE === "demo") {
      const storedExpenses = loadExpenses(trip.id);
      setExpenses(trip.id, storedExpenses);
      setPayers(trip.id, getPayersSummary(storedExpenses));
      return;
    }

    fetchExpenses(trip.id)
      .then((data) => setExpenses(trip.id, data))
      .catch((err) => {
        console.error("Error fetching expenses:", err)
        addToast({ message: "Error fetching expenses", type: "error" });
      });

    fetchPayersSummary(trip.id)
      .then((data) => setPayers(trip.id, data))
      .catch((err) => {
        console.error("Error fetching payers:", err)
        addToast({ message: "Error fetching payers", type: "error" });
    });

    }, [trip?.id, setExpenses, setPayers, addToast]);
  
  const handleAddExpense = async (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const amount = parseFloat(formData.get('amount'));

    const newExpense = {
          id: crypto.randomUUID(),
          description: formData.get('description'),       
          amount : amount,
          currency : formData.get('currency'),            
          startDate : formData.get('date'),
          endDate : showEndDate ? formData.get('endDate') : null,
          repeat : showEndDate,
          category : formData.get('category'),
          paidBy : formData.get('paidBy'),
          costPerDayUSD: amount,
        }

    if (DATA_MODE === "demo") {
      addExpenseToStore(trip.id, newExpense);
      const updatedExpenses = useExpenseStore.getState().expensesByTrip[trip.id];
      saveExpenses(trip.id, updatedExpenses);
      await refreshPayers();
      addToast({ message: "Expense added successfully", type: "success" });
      setShowAddExpenseForm(false);
      e.target.reset();
      setShowEndDate(false);
      return;
  }
  
    try{
      const savedExpense = await createExpense(trip.id, newExpense);
      addExpenseToStore(trip.id, savedExpense);
      await refreshPayers(); 
      addToast({ message: "Expense added successfully", type: "success" }); 

    } catch (err){
      console.error('Error adding expense:', err)
      addToast({ message: 'Error adding expense', type: 'error' });
    }
    setShowAddExpenseForm(false)
    e.target.reset()
    setShowEndDate(false);
  
}


const handleEditExpense = async (id) => {
  const expToUpdate = expenses.find(exp => exp.id === id)
    if (!expToUpdate) return

  //DEMO
  const normalizedExpense = {
    ...expToUpdate,
    ...editFormData,
    amount: Number(editFormData.amount ?? expToUpdate.amount ?? 0),
    costPerDayUSD: Number(editFormData.amount ?? expToUpdate.amount ?? 0),
  };

  if (DATA_MODE === "demo") {
    updateExpenseInStore(trip.id, id, normalizedExpense);
    const updatedExpenses = useExpenseStore.getState().expensesByTrip[trip.id];
    saveExpenses(trip.id, updatedExpenses);
    await refreshPayers();
    addToast({ message: "Expense updated successfully", type: "success" });
    setEditExpenseId(null);
    setEditFormData({});
    return;
  }

    try{ 
      
      const updatedExpense = await updateExpense(trip.id, id, editFormData);
      updateExpenseInStore(trip.id, id, updatedExpense);

      await refreshPayers();
      addToast({ message: "Expense updated successfully", type: "success" });
      setEditExpenseId(null); 
      setEditFormData({});

    }catch (error) {
      console.error('Error toggling expense:', error)
      addToast({ message: 'Error updating expense', type: 'error' });
    }

}


const handleDeleteExpense = async (id) => {
     const expToDelete = expenses.find(exp => exp.id === id)
    if (!expToDelete) return

    //DEMO
    if (DATA_MODE === "demo") {
      deleteExpenseFromStore(trip.id, id);
      const updatedExpenses = useExpenseStore.getState().expensesByTrip[trip.id];
      saveExpenses(trip.id, updatedExpenses);
      await refreshPayers();      
      addToast({ message: "Expense deleted successfully", type: "success" });
      return;
    }

    try {
      await removeExpense(trip.id, id)
      deleteExpenseFromStore(trip.id, id);

      await refreshPayers();  
      addToast({ message: "Expense deleted successfully", type: "success" });

    }catch (error) {
      console.error('Error deleting expense:', error)
      addToast({ message: 'Error deleting expense', type: 'error' });
    }
}





const refreshPayers = async () => {

  if (!trip?.id) return;

  if (DATA_MODE === "demo") {
    const currentExpenses = useExpenseStore.getState().expensesByTrip[trip.id] || [];
    setPayers(trip.id, getPayersSummary(currentExpenses));
    return;
  }
  
    try{
      const data = await fetchPayersSummary(trip.id);
      setPayers(trip.id, data);
    } catch (err) {
      console.error('Error getting payers:', err)
      addToast({ message: 'Error refreshing payers summary', type: 'error' });
    }

}


const getCategoryTotal = (category) => {
    return expenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)
      .toFixed(2)
}




const startEditing = (exp) => {
  setEditExpenseId(exp.id)
  setEditFormData({
    description: exp.description,
    amount: exp.amount,
    category: exp.category,
    paidBy: exp.paidBy,
    startDate: exp.startDate,
    endDate: exp.endDate || "",
    repeat: exp.repeat,
    currency: exp.currency,
    costPerDayUSD: exp.costPerDayUSD ?? exp.amount,
  })
}





  return  (
    <div className="budget-management-page">
      <div className="budget-header">
        <h1>  Budget Management for {trip.destination} </h1>
        <button className="back-btn" onClick={onBack}>← Back</button>
      </div>

      <div className="budget-subheader">
        <button className="add-expense-btn" 
          onClick={()=> setShowAddExpenseForm(true)}
          > + Add Expense </button>
          <p> Total Budget for the trip: {trip.budget}</p>
      </div>
      

   {/* add expense */}
      {showAddExpenseForm && (
  <div className="add-expense-form">
    <h2>✨ Add New Expense</h2>
    <form onSubmit={handleAddExpense}>
      <input 
        name="description" 
        type="text" 
        placeholder="What did you spend on?" 
        required
      />
      
      <div className="amount-currency-group">
        <input 
          name="amount" 
          type="number" 
          placeholder="Amount"
          step={"0.01"}
          required
        />
        <select name="currency" defaultValue="USD">
          <option value="USD $">USD</option>
          <option value="EUR €">EUR</option>
          <option value="ILS ₪">ILS</option>
        </select>
      </div>
      
      <input 
        name="date" 
        type="date" 
        required
      />
      
      <div className="checkbox-group">
        <input 
          type="checkbox" 
          id="repeat-checkbox"
          checked={showEndDate}
          onChange={(e) => setShowEndDate(e.target.checked)}
        />
        <label htmlFor="repeat-checkbox">Recurring expense?</label>
      </div>
      
      {showEndDate && (
        <input 
          name="endDate" 
          type="date" 
          placeholder="Until when?"
        />
      )}
      
      <select name="category" required>
        <option value="">Select Category</option>
        <option value="food">🍔 Food</option>
        <option value="transport">🚗 Transport</option>
        <option value="accommodation">🏨 Accommodation</option>
        <option value="activities">🎭 Activities</option>
        <option value="shopping">🛍️ Shopping</option>
        <option value="other">📦 Other</option>
      </select>
      
      <input 
        name="paidBy" 
        type="text" 
        placeholder="Who paid?"
      />
      
      <div className="form-buttons">
        <button type="button" onClick={() => setShowAddExpenseForm(false)}>
          Cancel
        </button>
        <button type="submit">
          Add Expense
        </button>
      </div>
    </form>
  </div>
)}

    {/* expenses diving by person */}
    <div className="summary">
      <div className="payers-summary">
          <h3>Expenses by Person</h3>
          {payers.length === 0 ? (
              <p> No payers recorded yet. </p>
          ) : (
              payers.map(p => (
                  <p key={p.name}> {p.name} paid ${p.totalPaid} </p>
              ))
          )}
      </div>

      {/* expenses summary */}
    <div className="expenses-summary">
      <h2>Expenses Summary</h2>
      <p>Total Expenses: 
        {expenses.length === 0 ? ' $0.00 = ₪0.00' :
        ('$'+ expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toFixed(2)
        + ' = ₪' + (expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0) * 3.5).toFixed(2) )}
        </p>
        <p> Accommodation: 
        {getCategoryTotal('accommodation')}
        </p>
        <p> Food: 
        {getCategoryTotal('food')}
        </p>
    </div>
  </div>

    {/* expenses list */}
  <div className="expenses-list">
    <h2>Expenses</h2>
    {expenses.length === 0 ? (
      <p>No expenses added yet.</p>
    ) :
     ([...new Set(expenses.map(e => e.startDate))]
    .sort((a, b) => new Date(b) - new Date(a))  // Newest first
    .map(date => (
      <div className='date-group' key={date}>
        <h3>{date.split('-').reverse().join('.')}</h3>
        {expenses
          .filter(exp => exp.startDate === date)
          .map(exp => (
            <div key={exp.id} className="expense-item">
                {editingExpenseId === exp.id ? (
                    <div className="edit-expense-inline">
                        <input
                            value = {editFormData.description}
                            onChange={(e)=> setEditFormData({ ...editFormData, description: e.target.value})}
                            placeholder="Description"
                        />
                        <input
                            type="number"
                            value={editFormData.amount}
                            onChange={(e)=> setEditFormData({...editFormData, amount: e.target.value})}
                            placeholder="Amount"
                        />
                        <input
                            value={editFormData.paidBy}
                            onChange={(e)=> setEditFormData({...editFormData, paidBy: e.target.value})}
                            placeholder="Who paid?"
                        />
                        <input
                            type="date"
                            value={editFormData.startDate}
                            onChange={(e)=> setEditFormData({...editFormData, startDate: e.target.value})}
                        />
                        <input
                            type="date"
                            value={editFormData.endDate}
                            onChange={(e)=> setEditFormData({...editFormData, endDate: e.target.value})}
                        />
                        <select
                            value={editFormData.category}
                            onChange={(e)=> setEditFormData({...editFormData, category: e.target.value})}
                        >
                            <option value="food">🍔 Food</option>
                            <option value="transport">🚗 Transport</option>
                            <option value="accommodation">🏨 Accommodation</option>
                            <option value="activities">🎭 Activities</option>
                            <option value="shopping">🛍️ Shopping</option>
                            <option value="other">📦 Other</option>
                        </select>

                        <div className = "inline-edit-buttons">
                            <button onClick={()=> handleEditExpense(exp.id)}>✅ Save</button>
                            <button
                              onClick={() => {
                                setEditExpenseId(null);
                                setEditFormData({});
                              }}
                            >
                              ❌ Cancel
                            </button>
                          </div>
                    </div>
               ) :(<>
          <div>
            <strong>{exp.description} - {exp.amount} {exp.currency} total</strong>
            {exp.repeat ? `${exp.startDate} until ${exp.endDate} - ${exp.costPerDayUSD}$ per day ` : ''} 
             - Paid by {exp.paidBy} | {exp.category}  
          </div>
          <div className="expense-buttons">
            <button 
              className="edit-btn"
              onClick={() => startEditing(exp)}
            >
              ✏️ Edit
            </button>
            <button 
              className="delete-btn"
              onClick={() => handleDeleteExpense(exp.id)}
            >
              🗑️ Delete
            </button>
          </div>
        </>
      )}
    </div>
  ))}
        <div className="daily-total">
            Daily Total: ${expenses
                .filter(exp => exp.startDate === date)
                .reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
                .toFixed(2)}
        </div>
      </div>
    ))
)}
  </div>

</div>


  )
}



