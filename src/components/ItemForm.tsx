import React,{useState} from "react";
import axios from 'axios';
import type {Item} from '../types/Item';

//URL base from your Backend Spring Boot
const API_BASE_URL = "http://localhost:8080/api/v1/items";

//The interface ItemFormProps defines callback function from App.tsx 
interface ItemFormProps {
    onItemCreated: (newItem: Item) => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ onItemCreated }) => {
    //States to catch forms data
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    //State UI feedback
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState <string | null>(null);

    const handleSubmit = async (e: React.FormEvent)  => {
        e.preventDefault();
        setSubmitError(null);
    

    //Basic validation
    if (!name || !description){
        setSubmitError("Name and Description are required.");
        return;
    }

    setIsSubmitting(true);

    try{
        //Creates a data object we will send to the backend
        const newItemDate = {name, description};
        //Requisition Post using axios, send data and wait the response (item with ID)
        const response = await axios.post<Item>(API_BASE_URL, newItemDate);

        //Clear formulary success
        setName('');
        setDescription('');

        //Notifies the component App.tsx with a new item from API 
        // This trigger the update of the list from App.tsx
        onItemCreated(response.data);
      
    }catch (error){
        //Shows a generic error messages case API fail
        console.error ('Error creatin item', error);
        setSubmitError('Failed to create item. Check API status (Backend must be running).');

    }finally {
        setIsSubmitting(false);
    }
  }
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg mb-8 border border-indigo-200">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4">Create New Item</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label  htmlFor="name" className="block text-sm font-medium text-gray-700 ">Name</label>
            <input
            id="name"
            type="text"
            value= {name}
            onChange =  {(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border  border-gray-300 rounded-md shadow-sm focus: outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isSubmitting}
            />
        </div>
        <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input 
            id="description"
            type="text"
            value= {description}
            onChange={(e) => setDescription (e.target.value)}
            className = "mt-1 block  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outiline-none focus:ring-indigo-500 sm:text-sm"
            disabled={isSubmitting}
            />
        </div>
        {submitError && (
            <p className="text-red-600 text-sm">{submitError}</p>
        )}

        <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outiline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disable:opacity-50"
        disabled ={isSubmitting}
        >
            {isSubmitting ? 'Creating...' : 'Created Item'}
        
        </button>
        </form>
    </div>
  );
};

export default ItemForm;

