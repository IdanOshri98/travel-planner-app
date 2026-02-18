import { useState, useEffect } from 'react'

export default function BudgetManagement({trip, onBack}) {
console.log("BUDGET VERSION 123"); // מספר ייחודי

  useEffect(() => {
    fetch(`http://localhost:5000/trips/${trip.id}/expenses`)
      .then(res => res.json())
      .then(data => setExpenses(data))
      .catch(err => console.error('Error fetching expenses:', err))

      getPayers();
  }, [trip.id])
  

  const [expenses, setExpenses] = useState([])
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false)
  const [showEndDate, setShowEndDate] = useState(false)
  const [editingExpenseId, setEditExpenseId] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [payers, setPayers] = useState([])


  const handleAddExpense = async (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)

    const newExpense = {
          description: formData.get('description'),       //תיאור
          amount : parseFloat(formData.get('amount')),
          currency : formData.get('currency'),            // מטבע - בינתיים הכל דולרים
          startDate : formData.get('date'),
          endDate : showEndDate ? formData.get('endDate') : null,
          repeat : showEndDate,
          category : formData.get('category'),
          payedBy : formData.get('payedBy'),
        }
  
    try{
      const response = await fetch(`http://localhost:5000/trips/${trip.id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(newExpense)
      })

    if(!response.ok)  throw new Error('Failed to add expense')
      

    console.log('POST payload:', newExpense);
    console.log('response status:', response.status);
    const savedExpense = await response.json();
    console.log('savedExpense from server:', savedExpense);


    setExpenses(prev => [...prev, savedExpense])
    await getPayers();  // Refresh payers after adding expense
  }catch(err){
    console.error('Error adding expense:', err)
  }


    setShowAddExpenseForm(false)
    e.target.reset()
  
}

const getPayers = async () => {

    try{
      const response = await fetch(`http://localhost:5000/trips/${trip.id}/payers`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
      })

      if(!response.ok)  throw new Error('Failed to get payers')

      const data = await response.json();
      console.log('payers response:', data);
      setPayers(Array.isArray(data) ? data : (data.payers || []));

    }

    catch(err){
    console.error('Error getting payers:', err)
    }

}


const getCategoryTotal = (category) => {
    return expenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + parseFloat(exp.costPerDayUSD), 0)
      .toFixed(2)
}


const editExpense = async (id) => {
  const expToUpdate = expenses.find(exp => exp.id === id)
    if (!expToUpdate) return

    try{ 
      const response = await fetch(`http://localhost:5000/trips/${trip.id}/expenses/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editFormData)
        }
      )
      if(!response.ok) throw new Error('Failed to toggle expense')

      const updatedExpense = await response.json()

      setExpenses(prev => 
                  prev.map(exp => exp.id === id ? updatedExpense : exp  ))

        getPayers();
        setEditExpenseId(null); 
        setEditFormData({});
    }catch (error) {
      console.error('Error toggling expense:', error)
    }

   

}


const startEditing = (exp) => {
    setEditExpenseId(exp.id)
    setEditFormData({
        description: exp.description,
        costPerDayUSD: exp.amount,
        category: exp.category,
        payedBy: exp.payedBy,
        startDate: exp.startDate,
        endDate: exp.endDate,
        repeat: exp.repeat
    })
}



const deleteExpense = async (id) => {
     const expToDelete = expenses.find(exp => exp.id === id)
    if (!expToDelete) return

    try {
      const response = await fetch(`http://localhost:5000/trips/${trip.id}/expenses/${id}`,
        {  method: 'DELETE'  } )

      if(!response.ok) throw new Error('Failed to delete expense')

      setExpenses(prev => prev.filter(exp => exp.id !== id))
      await getPayers();  

    }catch (error) {
      console.error('Error deleting expense:', error)
    }
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
        name="payedBy" 
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
        ('$'+ expenses.reduce((sum,exp) =>  sum + parseFloat(exp.costPerDayUSD),0).toFixed(2)
        + ' = ₪' + (expenses.reduce((sum,exp) =>  sum + parseFloat(exp.costPerDayUSD),0) * 3.5).toFixed(2) )}
        </p>
        <p> Accomodation: 
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
                            value={editFormData.payedBy}
                            onChange={(e)=> setEditFormData({...editFormData, payedBy: e.target.value})}
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
                            <button onClick={()=> editExpense(exp.id)}>✅ Save</button>
                            <button onClick={()=> setEditExpenseId(null)}>❌ Cancel</button>
                        </div>
                    </div>
               ) :(<>
          <div>
            <strong>{exp.description} - {exp.amount} {exp.currency} total</strong>
            {exp.repeat ? `${exp.startDate} until ${exp.endDate} - ${exp.costPerDayUSD}$ per day ` : ''} 
             - Paid by {exp.payedBy} | {exp.category}  
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
              onClick={() => deleteExpense(exp.id)}
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