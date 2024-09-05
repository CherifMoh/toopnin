"use client"

import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

function Thank() {

  const wilaya = localStorage.getItem('wilaya');

  return (
    <main className="w-full h-screen bg-gradient-to-r from-green-100 via-white to-blue-100 p-20 flex justify-center items-center">
      <div className="bg-white shadow-lg flex flex-col items-center gap-8 w-[90%] max-w-lg p-8 rounded-lg mx-auto border-t-8 border-green-500 animate-fade-in">
        <FontAwesomeIcon 
          icon={faCircleCheck} 
          className="text-green-500 mb-4 text-6xl animate-pulse"
        />
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
          ! شكرا 
        </h1>
        <p className="text-xl text-gray-600 text-center leading-8">
          تم استقبال طلبك بنجاح. التوصيل لولاية  
          <span className="text-gray-900 font-bold" dir="ltr"> {wilaya} </span>
          في 24 إلى 48 ساعة كحد أقصى. سيتم الاتصال بك قريبًا،
          يرجى ترك هاتفك مفتوحًا.
        </p>
        <Link
          href={"/"} 
          className="mt-6 bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-md transition-all"
          
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </main>
  );
}

export default Thank;
