import {useState,useEffect} from "react";
import axios from 'axios';
import type {Item} from './types/Item'; 
import './index.css'; //Assumes that exists a base CSS file for Vite/React
import ItemForm from "./components/ItemForm";


//Base URL from you Backend
const API_BASE_URL = 'http://localhost:8080/api/v1/items';

interface EditRowProps{
  item: Item;
  onUpdate: (updatedItem: Item) => void;
  onCancel: ()=> void;
}

const EditRow: React.FC<EditRowProps> = ({item, onUpdate, onCancel}) =>{
  const[name, setName] = useState(item.name);
  const[description, setDescription] = useState(item.description);
  const[isUpdating, setIsUpdating] = useState(false);
  const[updateError, setUpdateError] = useState<string | null>(null);

  const handleUpdate = async ()=>{
    setUpdateError(null);
    if(!name || !description){
      setUpdateError("Name and description are required.");
      return;
    }

    setIsUpdating(true);

    try{
      const updatedData = {name, description};
      const response = await axios.put<Item>(`${API_BASE_URL}/${item.id}`,updatedData);

      
    }catch (e) {
      console.error('Error updating item: ', e);
      setUpdateError('Failed to update item. Check API status.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
  <div className="p-4 bg-yellow-100 rounded-md shadow-inner border border-yellow-300 space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">

        <input type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New Name"
        className="p-1 border border-gray-400 rounded-md flex-grow focus:ring-yellow-500 focus:border-yellow-500"
        disabled={isUpdating} 
        />

        <input type="text" 
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="New Description"
        className="p-1 border border-gray-400 rounded-md flex-grow focus:ring-yellow-500 focus:border-yellow-500"
        disabled={isUpdating}
        />

      </div>

    {updateError && <p className="text-red-600 text-sm">{updateError}</p>}

    <div className="flex gap-2 justify-end">

      <button
      onClick={handleUpdate}
      className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition duration-150"
      disabled={isUpdating}
      >

        {isUpdating ? 'Saving...' : 'Save'}

      </button>
      <button
      onClick={onCancel}
      className="px-3 py-1 bg-gray-400 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-500 transition duration-150"
      disabled={isUpdating}
      >
      Cancel
      </button>
    </div>
  </div>
  )
}

function App(){

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //new control state from each item is updating.
  const [editingItemId, setEditingItemId] = useState<number | null>(null);


  //function: add new item to list without reload all items
  const handleItemCreated = (newItem: Item) => {
    //Add new Item to the beginning of the list
    setItems(prevItems => [newItem, ...prevItems]);
  }
  //Updating logic(PUT)
  const handleItemUpdate = (updatedItem: Item) => {
    //Map a list, find an item by ID, change it.
    setItems(prevItems => 
      prevItems.map(item =>
        item.id === updatedItem.id ?updatedItem : item
      )
    );
    setEditingItemId(null);
  };

  //Delete logic (DELETE)
  const handleItemDelete = async (id: number) =>{
    if(!window.confirm(`Are you sure you want to delete item ID: ${id}? This action is irreversible.`)){
      return;
    }
    try{
    await axios.delete(`${API_BASE_URL}/${id}`);

    setItems(prevItems => prevItems.filter(item => item.id !== id));

   } catch (e) {
      console.error('Error Deleting item', e);
      setError(`Failed to delete ID ${id}. please check your backend conection.`);
   }
  };

  useEffect(()=>{
    const fetchItems = async () => {
      try{
        //clear error before try it again
        setError(null);

        //request GET from backend
        const response = await axios.get<Item[]>(API_BASE_URL);
        setItems(response.data);
      }
      catch (e) {
        
        //Catch error that certainly is CORS
        console.error("Error fetching data from backend:", e);

        //Informe user that he got a CORS error.
        setError("Fail to fetch items. Please check the browser console for CORS error. Is the Spring Boot backend running?");
      }finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []); // Run only one time
  
  //Render State
  if(loading){
    return (
      <div className= "flex justify-center items-center h-screen bg-gray-50">
        <div className = "tex-xl front-medium text-indigo-600">Loading items...</div>
      </div>
    );
  }

  return(
    <div className="container mx-auto p-4 max-w-2x1">
      <h1 className="text-3x1 font-bold text-center text-gray-800 mb-6">
        Full Stack CRUD (React + Spring Boot)
      </h1>
      {/*Render Forms and pass function callback*/}
      <ItemForm onItemCreated={handleItemCreated}/>
      <div className="bg-white shadow-x1 rounded-lg p-6">
        <h2 className="text-2x1 font-semibold text-indigo-600 mb-4">
            Item List (from Spring Boot API)
        </h2>

        {/*Shows Error*/}
        {error && (
          <div className="bg-red-100 border-1-4 border-red-500 text-red-700 p-3 mb-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/*Shows List*/}
        {items.length === 0 && !error ? (
          <p className="text-gray-500"> No items found. Create some in Spring Boot DB first.</p>
        ) : (
          <ul className="space-y-3">
            {items.map (item =>(
              <li key = {item.id} className="p-3 bg-indigo-50 rounded-md shadow-sm border border-indigo-200">
                {/*Conditional logic: if ID is equals edit ID , than render EditRow*/}
                {editingItemId === item.id ? (
                  <EditRow
                  item={item}
                  onUpdate={handleItemUpdate}
                  onCancel={()=> setEditingItemId(null)}
                  />
                ): (
                  <div className="flex justify-between items-center">
                    <div>
                   <strong className="text-gray-900">{item.name}</strong>:
                   <span className="text-gray-600 ml-2">{item.description}</span>
                   <span className="text-xs text-indigo-400 block mt-1 ">ID: {item.id}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {/*Btn edit, defines the state for item ID*/}
                    <button
                    onClick={()=> setEditingItemId(item.id)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition duration-150"
                    aria-label={`Edit item ${item.name}`}
                    >
                     Edit
                    </button>

                    {/*Button delete*/}
                <button 
                  onClick={()=> handleItemDelete(item.id)}
                  className="ml-4 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition duration-150"
                  aria-label={`Delete Item ${item.name}`}
                >
                  Delete
                </button>
                  </div>
               </div> 
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;