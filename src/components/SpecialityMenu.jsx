import React from 'react'
 import { specialityData } from '../assets/assets'; 
 import {Link} from 'react-router-dom'

const SpecialityMenu = () => {
  return (
    <div className='flex flex-col items-center gap-4 py-16 text-gray-800' id='speciality'>
       <h1 className='text-3xl font-medium'>Find by Speciality</h1> 
        <p className='w-auto text-center flex flex-1 text-wrap  text-sm'>Simply browse through our extesive list of trusted doctors,shedule your appointment hassle-free </p>
        <div className='grid grid-cols-3 gap-1 sm:flex sm:gap-6 sm:justify-center pt-5 w-full overflow-scroll'>
            {specialityData.map((item,index)=>{
                return <Link onClick={()=>scrollTo(0,0)} className='flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500' key={index} to={`/doctors/${item.speciality}`}>
                    <img className='w-16 sm:w-24 mb-2' src={item.image} alt="" />
                    <p>{item.speciality}</p>
                </Link>
            })}
        </div> 
    </div>
  )
}

export default SpecialityMenu