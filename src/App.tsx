import {useState,useEffect} from "react";
import axios from 'axios';
import type {Item} from './types/Item'; 
import './index.css'; //Assumes that exists a base CSS file for Vite/React
import ItemForm from "./components/ItemForm";


//Base URL from you Backend
const API_BASE_URL = 'http://localhost:8080/api/v1/items';

function App(){

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //function: add new item to list without reload all items
  const handleItemCreated = (newItem: Item) => {
    //Add new Item to the beginning of the list
    setItems(prevItems => [newItem, ...prevItems]);
  }

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
        Full Stack Portifolio Client (React + TS)
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
                <strong className="text-gray-900">{item.name}</strong>:
                <span className="text-gray-600 ml-2">{item.description}</span>
                <span className="text-xs text-indigo-400 block mt-1 ">ID: {item.id}</span>
              </li>
            ))}
          </ul>
        )
        }
      </div>
    </div>
  );
}

export default App;