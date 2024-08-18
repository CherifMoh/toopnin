"use client"
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Spinner from "../../../../components/loadings/Spinner";


const fetchRewMates = async () => {
    const res = await axios.get(`/api/storage/rewMates`);
    if (!res.data) return []
    return res.data;
}

const fetchProduct = async (id) => {
    const res = await axios.get(`/api/products/${id}`);
    return res.data[0];
}

function ProductUpdate({ params }) {

    const { data: RewMates, isLoading: rewLoading, isError: rewIsError, error: rewError } = useQuery({
        queryKey: ['Rew Mates'],
        queryFn: fetchRewMates
    });

    const { data: SelectedProduct, isLoading, isError, error } = useQuery({
        queryKey: ['product For Update'],
        queryFn: () => fetchProduct(params.productId)
    });

    const [newProduct, setNewProduct] = useState({});

    const [isImages, setIsImages] = useState(false);

    const [isSubmiting, setIsSubmitting] = useState(false)

    const [isRewMates, setIsRewMates] = useState([])

    const [usingLandingPage, setUsingLandingPage] = useState(false)

    const textareaRef = useRef(null);

    const dropDownTextareaRef = useRef(null);


    async function convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = (err) => {
                reject(err);
            };
        });
    }


    async function handleSubmit(e) {
        e.preventDefault();

        if (!newProduct.imageOff || !newProduct.imageOn) return setIsImages(true)

        setIsSubmitting(true)

        try {
            const res = await axios.put(`/api/products/${params.productId}`, newProduct)
            console.log(res.data);
            queryClient.invalidateQueries('designs');
            router.refresh()
            router.push('/admin/products')
        } catch (err) {
            console.log(err);
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        setNewProduct(SelectedProduct)
        if(Array.isArray(SelectedProduct?.landingPageImages) && SelectedProduct?.landingPageImages?.length > 0){
            setUsingLandingPage(true)
        }
    }, [SelectedProduct])




    const queryClient = useQueryClient()

    typeof document !== 'undefined' && document.body.classList.add('bg-white')

    async function handleFileUpload(event, state) {
        if (state == 'On') {
            const fileInput = event.target;
            const file = fileInput.files[0];

            if (!file) {
                e.target.files[0] = []
            }
            const formData = new FormData();
            formData.append('image', file);

            fetch('https://toopnin.com:8444/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {

                setNewProduct(pre => ({
                    ...pre,
                    imageOn: data,
                    gallery: pre.gallery
                        ? [...pre.gallery, data]
                        : [data]
                }))
            })
            .catch(error => {
                console.error('Error:', error);
                // document.getElementById('message').innerHTML = `<p>Upload failed. Please try again.</p>`;
            });
           
        } else {
            const fileInput = event.target;
            const file = fileInput.files[0];

            if (!file) {
                e.target.files[0] = []
            }
            const formData = new FormData();
            formData.append('image', file);

            fetch('https://toopnin.com:8444/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {

                setNewProduct(pre => ({
                    ...pre,
                    imageOff: data,
                    gallery: pre.gallery
                        ? [...pre.gallery, data]
                        : [data]
                }))
            })
            .catch(error => {
                console.error('Error:', error);
                // document.getElementById('message').innerHTML = `<p>Upload failed. Please try again.</p>`;
            });
        }
    }


    const router = useRouter()

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>{error.message}</div>

    if (rewLoading) return <div>Loading...</div>
    if (rewIsError) return <div>{rewError.message}</div>

    if (!newProduct) return

    function handelOptionChange(e, i) {

        const { name, value } = e.target;

        setNewProduct(prevState => {
            if (prevState?.options) {

                const updatedOptions = [...prevState.options]; // Create a copy of options array
                updatedOptions[i] = { ...updatedOptions[i], [name]: value, selected: false }; // Update the specific option at index i

                return {
                    ...prevState,
                    options: updatedOptions // Set the updated options array
                };
            } else {
                return {
                    ...prevState,
                    options: [{ [name]: value, selected: false }]
                }
            }
        });
    }


    function checkFileSize(file, input) {
        if (file) {
            const fileSize = file.size; // in bytes
            const maxSize = 12 * 1024 * 1024; // 12MB in bytes
            if (fileSize > maxSize) {
                alert('File size exceeds the limit. Please select a smaller file.');
                input.value = ''
                return false;
            }
            return true;
        }
    }


    async function handleAddToGallery(event) {
        const fileInput = event.target;
        const file = fileInput.files[0];

        if (!file) {
            e.target.files[0] = []
        }
        const formData = new FormData();
        formData.append('image', file);

        fetch('https://toopnin.com:8444/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            setNewProduct(pre => (Array.isArray(pre.gallery)
            ? { ...pre, gallery: [...pre?.gallery, data] }
            : { ...pre, gallery: [data] }
        ))
        })
        .catch(error => {
            console.error('Error:', error);
        });
        
    }

    const handleRemoveGalleryImage = (index) => {
        const updatedGallery = newProduct.gallery.filter((_, i) => i !== index);
        setNewProduct(pre => ({
            ...pre,
            gallery: updatedGallery
        }));
    };

    const galleryElemnt = newProduct.gallery?.map((image, i) => {

        return (
            <div key={image} className='relative'>
                <div
                    onClick={() => handleRemoveGalleryImage(i)}
                    className='absolute top-1 right-5 flex justify-center items-center cursor-pointer bg-white px-2 rounded-full text-center'
                >x</div>
                <img
                    width={160}
                    height={160}
                    className="w-40 h-40"
                    src={image}
                    alt=""
                />
            </div>
        )
    })

    function handleAddOption() {
        setNewProduct(pre => ({
            ...pre,
            options: [...pre.options, {}]
        }))
    }

    function handleRemoveOption(index) {
        setNewProduct(prevState => {
            const updatedOptions = [...prevState.options]; // Create a copy of options array
            updatedOptions.splice(index, 1); // Remove the option at the specified index
            return {
                ...prevState,
                options: updatedOptions // Set the updated options array
            };
        });
        setOptionsArray(prevOptions => {
            const updatedOptions = prevOptions.filter((_, i) => i !== index); // Remove the option at the specified index
            return updatedOptions;
        });
    }

    async function handelOptionImageChange(e, i) {
        const file = e.target.files[0];
        if (!file) {
            return e.target.value = ''
        }
        if (!checkFileSize(file, e.target)) return
        const base64 = await convertToBase64(file);

        setNewProduct(prevState => {
            if (prevState?.options) {

                const updatedOptions = [...prevState.options]; // Create a copy of options array
                updatedOptions[i] = { ...updatedOptions[i], image: base64 }; // Update the specific option at index i

                return {
                    ...prevState,
                    options: updatedOptions // Set the updated options array
                };
            } else {
                return {
                    ...prevState,
                    options: [{ image: base64 }]
                }
            }
        });
    }

    const optionsElemnt = newProduct.options?.map((option, i) => {

        return (
            <div className="flex gap-2 mt-6 relative" key={option.name}>

                <button
                    className="bg-gray-400 rounded-full px-2 absolute -top-2 -right-2"
                    onClick={() => handleRemoveOption(i)}
                >
                    X
                </button>

                {newProduct.options?.length >= i + 1 && 'image' in newProduct.options[i]
                    ?
                    <div className='relative'>
                        <img
                            src={newProduct?.options[i].image}
                            alt=""
                            width={96} height={80}
                        />
                        <input
                            type="file"
                            name="image"
                            onChange={(e) => handelOptionImageChange(e, i)}
                            className='opacity-0 h-full w-full absolute top-0 left-0'
                        />
                    </div>
                    :
                    <div className="border-2 border-dashed border-black w-24 h-20">
                        <input
                            type="file"
                            name="image"
                            onChange={(e) => handelOptionImageChange(e, i)}
                            className='opacity-0 h-full w-full'
                        />
                    </div>
                }

                <input
                    type="text"
                    placeholder="Name"
                    name="title"
                    value={option.title}
                    onChange={(e) => handelOptionChange(e, i)}
                    className="border-2 border-gray-400 rounded-md p-4 w-full"
                />

                <input
                    type="Number"
                    placeholder="Price"
                    name="price"
                    defaultValue={option.price}
                    onChange={(e) => handelOptionChange(e, i)}
                    className="border-2 border-gray-400 rounded-md p-4"
                />
            </div>
        )
    })

    function handelSaleChange(e, i) {
        const value = e.target.value
        const name = e.target.name

        setNewProduct(prevState => {
            if (prevState?.sales) {

                const updatedSales = [...prevState.sales]; // Create a copy of sales array
                updatedSales[i] = { ...updatedSales[i], [name]: value }; // Update the specific sale at index i

                return {
                    ...prevState,
                    sales: updatedSales // Set the updated sales array
                };
            } else {
                return {
                    ...prevState,
                    sales: [{ [name]: value }]
                }
            }
        });
    }

    function handleRemoveSale(index) {

        setNewProduct(prevState => {
            const updatedSales = [...prevState.sales]; // Create a copy of options array
            updatedSales.splice(index, 1); // Remove the option at the specified index
            return {
                ...prevState,
                sales: updatedSales // Set the updated options array
            };
        });
    }

    function handleAddSale() {
        setNewProduct(pre => ({
            ...pre,
            sales: [...pre?.sales, {}]
        }))
    }

    const salesElemnt = newProduct.sales?.map((sale, i) => {
        return (
            <div className="flex gap-2 mt-6 relative" key={sale}>

                <button
                    className="bg-gray-400 rounded-full px-2 absolute -top-2 -right-2"
                    onClick={() => handleRemoveSale(i)}
                >
                    X
                </button>

                <input
                    type="Number"
                    placeholder="Quantity"
                    name="qnt"
                    onChange={(e) => handelSaleChange(e, i)}
                    defaultValue={sale.qnt}
                    className="border-2 border-gray-400 rounded-md p-4"
                />
                <input
                    type="Number"
                    placeholder="Sale %"
                    name="percen"
                    onChange={(e) => handelSaleChange(e, i)}
                    defaultValue={sale.percen}
                    className="border-2 border-gray-400 rounded-md p-4 w-full"
                />
            </div>
        )
    })

    function handelPartChange(e, i) {
        const value = e.target.value
        let name = e.target.name


        setNewProduct(prevState => {
            if (prevState?.parts) {

                const updatedParts = [...prevState.parts]; // Create a copy of sales array
                updatedParts[i] = { ...updatedParts[i], [name]: value }; // Update the specific sale at index i

                return {
                    ...prevState,
                    parts: updatedParts // Set the updated sales array
                };
            } else {
                return {
                    ...prevState,
                    parts: [{ [name]: value }]
                }
            }
        });
    }

    function handelPartOptChange(e, i) {
        
        const value = e.target.value

        setNewProduct(prevState => {
            if (prevState?.parts) {

                const updatedParts = [...prevState.parts]; // Create a copy of sales array


                if (updatedParts[i]?.options) {
                    if(updatedParts[i]?.options?.includes(value)){
                        updatedParts[i] = { ...updatedParts[i], options:updatedParts[i]?.options?.filter(item => item !== value)}
                    }else{
                        updatedParts[i] = { ...updatedParts[i], options:[...updatedParts[i]?.options, value] }; // Update the specific sale at index i
                    }
                }else{
                    updatedParts[i] = { ...updatedParts[i], options:[value] };
                }
                
                
                return {
                    ...prevState,
                    parts: updatedParts // Set the updated sales array
                };
            } else {
                return {
                    ...prevState,
                    parts: [{ options: [value] }]
                }
            }
        });
    }

    function handelPartMatesChange(value, i) {
        setNewProduct(prevState => {
            if (prevState?.parts) {

                const updatedParts = [...prevState.parts]; // Create a copy of sales array
                if (updatedParts[i]?.mates) {
                    updatedParts[i] = { ...updatedParts[i], mates: [...updatedParts[i].mates, { name: value, qnt: 1 }] }; // Update the specific sale at index i
                    return {
                        ...prevState,
                        parts: updatedParts // Set the updated sales array
                    };
                } else {
                    updatedParts[i] = { ...updatedParts[i], mates: [{ name: value, qnt: 1 }] };
                    return {
                        ...prevState,
                        parts: updatedParts
                    }
                }

            } else {
                return {
                    ...prevState,
                    parts: [{ mates: [{ name: value, qnt: 1 }] }]
                }
            }
        });
    }

    function handelPartMatesQntChange(newQnt, MateName, i) {
        setNewProduct(prevState => {
            newQnt = Number(newQnt); // Ensure newQnt is a number

            // Initialize parts array if not present in prevState
            const parts = prevState?.parts ? [...prevState.parts] : [];

            // Initialize the part at index i if not present
            if (!parts[i]) {
                parts[i] = { mates: [] };
            } else {
                parts[i] = { ...parts[i] }; // Create a shallow copy of the part
            }

            // Initialize mates array if not present in the part
            parts[i].mates = parts[i].mates ? [...parts[i].mates] : [];

            // Update or add the mate
            const mateIndex = parts[i].mates.findIndex(mate => mate.name === MateName);
            if (mateIndex > -1) {
                // Mate already exists, update quantity
                parts[i].mates[mateIndex] = { ...parts[i].mates[mateIndex], qnt: newQnt };
            } else {
                // Mate doesn't exist, add new mate
                parts[i].mates.push({ name: MateName, qnt: newQnt });
            }

            return { ...prevState, parts };
        });
    }

    function handleRemovePart(index) {

        if (Array.isArray(newProduct.parts)) {

            setNewProduct(prevState => {
                const updatedParts = [...prevState.parts]; // Create a copy of options array
                updatedParts.splice(index, 1); // Remove the option at the specified index
                return {
                    ...prevState,
                    parts: updatedParts // Set the updated options array
                };
            });
        }

    }

    function handleAddPart() {
        setNewProduct(pre => ({
            ...pre,
            parts: [...pre?.parts, {}]
        }))
    }

    function togelIsRewMates(id) {

        setIsRewMates(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id); // Remove the id if it's found
            } else {
                return [...prev, id]; // Add the id if it's not found
            }
        });

    }
    function rewMatesShowElement(i, num) {

        return RewMates.map(mate => {
            if (Array.isArray(newProduct?.parts) && newProduct?.parts[i]?.mates
                && newProduct?.parts[i]?.mates.some(obj => obj.name === mate.name)
            ) return null

            return (
                <div
                    key={mate._id}
                    className="bg-gray-500 cursor-pointer py-1 px-3 rounded-full"
                    onClick={() => {
                        handelPartMatesChange(mate.name, i)
                        togelIsRewMates(num)
                    }}
                >
                    {mate.name}
                </div>
            )
        });
    }

    function removeMate(i, mate) {
        setNewProduct(pre => {
            if (Array.isArray(pre.parts)) {
                // Create a new array of parts
                const newParts = pre.parts.map((part, index) => {
                    if (index === i) {
                        // For the specific part, create a new mates array by filtering out the mate
                        return {
                            ...part,
                            mates: part.mates.filter(item => item !== mate)
                        };
                    }
                    return part;
                });
                // Return the new state object
                const newState = {
                    ...pre,
                    parts: newParts
                };
                return newState;
            }
            return pre;
        })
    }

    function rewMatesElement(i) {
        if (Array.isArray(newProduct?.parts) && newProduct?.parts[i]?.mates) {
            return newProduct?.parts[i]?.mates.map((mate, index) => {

                return (
                    <div
                        key={index}
                        className="bg-gray-500 relative flex gap-1 py-1 px-3 rounded-full"
                    >
                        <input
                            type="text"
                            min={1}
                            defaultValue={mate.qnt}
                            className='bg-transparent w-4 no-focus-outline no-spin'
                            onChange={(e) => handelPartMatesQntChange(e.target.value, mate.name, i)}
                        />
                        <div>
                            {mate.name}
                        </div>
                        <span
                            className='absolute -top-1 -right-1 cursor-pointer bg-red-500 px-1 text-xs rounded-full'
                            onClick={() => removeMate(i, mate)}
                        >X</span>
                    </div>
                )
            })
        }
    }

    function optionsOfPartsElemnt(i){
        return newProduct.options?.map((option) => {
  
            return (
                <div
                    key={option.title}
                    className="flex gap-2 items-center"
                >
                    <input 
                        type="radio" 
                        value={option.title} 
                        id={option.title} 
                        checked={Array.isArray(newProduct?.parts) &&  newProduct?.parts[i]?.options?.includes(option.title)|| false}
                        onClick={(e)=>handelPartOptChange(e,i)}
                    />
                    <label htmlFor={option.title}>{option.title}</label>
                </div>
            )
        })
    }

    const partsElemnt = newProduct.parts?.map((part, i) => {

        return (
            <div 
                className="flex gap-2 flex-col z-10 mt-6 shadow-md relative" 
                key={part.name}
            >
                <div className=" pl-8 flex gap-4 z-10">
                    <div className="flex gap-2 items-center">
                        <input 
                            type="radio" 
                            value="all" 
                            id='All' 
                            checked={newProduct?.parts?.[i]?.options?.includes('all') || false}
                            onClick={(e)=>handelPartOptChange(e,i)}
                        />
                        <label htmlFor='All'>All</label>
                    </div>
                    {optionsOfPartsElemnt(i)}
                </div>
                <div
                    className="size-full absolute top-0 right-0"
                    onClick={() => setIsRewMates([])}
                ></div>
                <div className="flex gap-2">
                    <button
                        className="bg-gray-400 z-20 rounded-full px-2 absolute -top-2 -right-2"
                        onClick={() => handleRemovePart(i)}
                    >
                        X
                    </button>

                    <input
                        type="text"
                        placeholder="Part Name"
                        defaultValue={part.name}
                        name="name"
                        onChange={(e) => handelPartChange(e, i)}
                        className="border-2 h-16 z-10 border-gray-400 rounded-md p-4"
                    />

                    <input
                        type="number"
                        placeholder="Part Qntity"
                        name="qnt"
                        defaultValue={part.qnt}
                        onChange={(e) => handelPartChange(e, i)}
                        className="border-2 h-16 z-10 border-gray-400 rounded-md p-4"
                    />

                    <div
                        className="flex flex-col flex-grow z-10"
                    >
                        <input
                            type="text"
                            placeholder="rew mates"
                            name="mates"
                            onClick={(e) => togelIsRewMates(part.name)}
                            className="border-2 h-16 w-full border-gray-400 rounded-md p-4"
                        />
                        {isRewMates.includes(part.name) &&
                            <div
                                className="w-[578px] flex-wrap mt-2 p-4 rounded-md flex gap-6 text-white bg-gray-900"
                            >{rewMatesShowElement(i, part.name)}</div>
                        }
                    </div>
                </div>
                <div className="flex p-3 gap-2 z-10 text-white">
                    {rewMatesElement(i, part.name)}
                </div>
            </div>
        )
    })

    function handleRemoveDropDown(index) {

        if (Array.isArray(newProduct.dropDowns)) {

            setNewProduct(prevState => {
                const updatedDropDowns = [...prevState.dropDowns]; // Create a copy of options array
                updatedDropDowns.splice(index, 1); // Remove the option at the specified index
                return {
                    ...prevState,
                    dropDowns: updatedDropDowns // Set the updated options array
                };
            });
        }

    }

    function handelDropDownChange(e, i) {
        const value = e.target.value
        const name = e.target.name

        setNewProduct(prevState => {
            if (prevState?.dropDowns) {

                const updatedDropDowns = [...prevState.dropDowns]; // Create a copy of sales array
                updatedDropDowns[i] = { ...updatedDropDowns[i], [name]: value }; // Update the specific sale at index i

                return {
                    ...prevState,
                    dropDowns: updatedDropDowns // Set the updated sales array
                };
            } else {
                return {
                    ...prevState,
                    dropDowns: [{ [name]: value }]
                }
            }
        });
    }

    function handleAddDropDown() {
        setNewProduct(pre => ({
            ...pre,
            dropDowns: [...pre?.dropDowns, {}]
        }))
    }

    const dropDownsElement = newProduct?.dropDowns?.map((num, i) => {
        return (
            <div className="flex gap-2 mt-6 relative" key={num}>

            <button
                className="bg-gray-400 rounded-full px-2 absolute -top-2 -right-2"
                onClick={() => handleRemoveDropDown(i)}
            >
                X
            </button>
            <div
                className="flex flex-col w-[450px]"
            >
                <input
                    type="text"
                    placeholder="Title"
                    name="title"
                    value={Array.isArray(newProduct?.dropDowns) ? newProduct?.dropDowns[i]?.title:''}
                    onChange={(e) => handelDropDownChange(e, i)}
                    className="border-2 border-gray-400 rounded-md p-4"
                />
                <input
                    type="text"
                    placeholder="header"
                    name="header"
                    value={Array.isArray(newProduct?.dropDowns) ? newProduct?.dropDowns[i]?.header:''}
                    onChange={(e) => handelDropDownChange(e, i)}
                    className="border-2 border-gray-400 rounded-md p-4 w-full"
                />
            </div>

            <textarea
                ref={dropDownTextareaRef}
                placeholder="body"
                type='text'
                name="body"
                value={Array.isArray(newProduct?.dropDowns) ? newProduct?.dropDowns[i]?.body:''}
                className="border-2 border-gray-400 rounded-md p-2 pb-10 resize-y w-[450px] min-h-[100px]"
                onChange={(e) => handelDropDownChange(e, i)}
                onKeyDown={(e) => handleDropDownKeyDown(e, i)}
            />
        </div>
        )
    })

    function handleDropDownKeyDown(e, i) {
        if (e.key === "Enter") {
          e.preventDefault(); // Prevents the default behavior of creating a new line
      
          // Insert a newline character at the current cursor position
          const { selectionStart, selectionEnd } = dropDownTextareaRef.current;
          const currentValue = newProduct.dropDowns[i].body;
          const newValue =
            currentValue.substring(0, selectionStart) +
            "\n" +
            currentValue.substring(selectionEnd);
            
          setNewProduct((prev) => {
            const updatedDropDowns = [...prev.dropDowns];
            updatedDropDowns[i] = { ...updatedDropDowns[i], body: newValue };
            return { ...prev, dropDowns: updatedDropDowns };
          });
      
          // Move the cursor to after the inserted newline character
          const newCursorPosition = selectionStart + 1;
          setTimeout(() => {
            dropDownTextareaRef.current.selectionStart = newCursorPosition;
            dropDownTextareaRef.current.selectionEnd = newCursorPosition;
          }, 0);
        }
    }


    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevents the default behavior of creating a new line

            // Insert a newline character at the current cursor position
            const { selectionStart, selectionEnd } = textareaRef.current;
            const currentValue = newProduct.description;
            const newValue =
                currentValue.substring(0, selectionStart) +
                "\n" +
                currentValue.substring(selectionEnd);
            setNewProduct((prevProduct) => ({
                ...prevProduct,
                description: newValue,
            }));

            // Move the cursor to after the inserted newline character
            const newCursorPosition = selectionStart + 1;
            textareaRef.current.selectionStart = newCursorPosition;
            textareaRef.current.selectionEnd = newCursorPosition;
        }
    };

    function handleLandingPageImageChange(event,i){
        const fileInput = event.target;
        const file = fileInput.files[0];

        if (!file) {
            e.target.files[0] = []
        }
        const formData = new FormData();
        formData.append('image', file);

        fetch('https://toopnin.com:8444/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {

            setNewProduct((prev) => {
                let updatedLandingPageImages;
                if (Array.isArray(prev.landingPageImages) && prev.landingPageImages.length > 0) {
                    updatedLandingPageImages = [...prev.landingPageImages];
                    updatedLandingPageImages[i] = data;
                } else {
                    updatedLandingPageImages = [data];
                }
                return { ...prev, landingPageImages: updatedLandingPageImages };
            });
        })
        .catch(error => {
            console.error('Error:', error);
            // document.getElementById('message').innerHTML = `<p>Upload failed. Please try again.</p>`;
        });
    }

    function langingPgesElement (){
        const Images = newProduct?.landingPageImages
        if(!Array.isArray(Images) || Images.length === 0){
            return(
                <div className="flex items-center justify-evenly">
                    <div className='w-40 h-72 border relative border-dashed border-gray-600'>
                        <span
                            className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-lg bg-white px-2 rounded-full text-center"
                        >
                            الصورة الأولى
                        </span>                      
                        <input 
                            type="file" 
                            name=""
                            className="size-full cursor-pointer opacity-0"
                            onChange={(e) => handleLandingPageImageChange(e,0)}
                        />
                    </div>
                    <div className='w-40 h-72 border relative border-dashed border-gray-600'>
                        <span
                            className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-lg bg-white px-2 rounded-full text-center"
                        >
                            الصورة الثانية
                        </span> 
                    </div>
                    <div className='w-40 h-72 border relative border-dashed border-gray-600'>
                        <span
                            className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-lg bg-white px-2 rounded-full text-center"
                        >
                            checkout bg  <br /> 405 px
                        </span> 
                    </div>
                </div>
            )
        }

        if(Images.length === 1){
            return(
                <div className="flex items-start justify-evenly">
                    <div className='w-40 relative'>
                        <input 
                            type="file" 
                            name=""
                            className="size-full opacity-0 cursor-pointer absolute z-[10] top-0 left-0"
                            onChange={(e) => handleLandingPageImageChange(e,0)}
                        />
                        <img src={Images[0]} alt=""/>
                    </div>
                    <div className='w-40 h-72 border relative border-dashed border-gray-600'>
                        <span
                            className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-lg bg-white px-2 rounded-full text-center"
                        >
                            الصورة الثانية
                        </span> 
                        <input 
                            type="file" 
                            name=""
                            className="size-full cursor-pointer opacity-0"
                            onChange={(e) => handleLandingPageImageChange(e,1)}
                    />
                    </div>
                    <div className='w-40 h-72 border relative border-dashed border-gray-600'>
                        <span
                            className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-lg bg-white px-2 rounded-full text-center"
                        >
                            checkout bg  <br /> 405 px
                        </span> 
                    </div>
                </div>
            )
        }

      
        if(Images.length === 2){
            return(
                <div className="flex items-start justify-evenly">
                    <div className='w-40 relative'>
                        <input 
                            type="file" 
                            name=""
                            className="size-full opacity-0 cursor-pointer absolute z-[10] top-0 left-0"
                            onChange={(e) => handleLandingPageImageChange(e,0)}
                        />
                        <img src={Images[0]} alt=""/>
                    </div>
                    <div className='w-40 relative'>
                        <img src={Images[1]} alt=""/> 
                        <input 
                            type="file" 
                            name=""
                            className="size-full cursor-pointer absolute z-[10] top-0 left-0 opacity-0"
                            onChange={(e) => handleLandingPageImageChange(e,1)}
                        />
                    </div>
                    <div className='w-40 h-72 border relative border-dashed border-gray-600'>
                        <span
                            className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-lg bg-white px-2 rounded-full text-center"
                        >
                            checkout bg  <br /> 405 px
                        </span> 
                        <input 
                            type="file" 
                            name=""
                            className="size-full cursor-pointer absolute z-[10] top-0 left-0 opacity-0"
                            onChange={(e) => handleLandingPageImageChange(e,2)}
                        />
                    </div>
                </div>
            )
        }

        if(Images.length === 3){
            return(
                <div className="flex items-start justify-evenly">
                <div className='w-40 relative'>
                    <input 
                        type="file" 
                        name=""
                        className="size-full opacity-0 cursor-pointer absolute z-[10] top-0 left-0"
                        onChange={(e) => handleLandingPageImageChange(e,0)}
                    />
                    <img src={Images[0]} alt=""/>
                </div>
                <div className='w-40 relative'>
                    <img src={Images[1]} alt=""/> 
                    <input 
                        type="file" 
                        name=""
                        className="size-full cursor-pointer absolute z-[10] top-0 left-0 opacity-0"
                        onChange={(e) => handleLandingPageImageChange(e,1)}
                    />
                </div>
                <div className='w-40 relative'>
                    <img src={Images[2]} alt=""/> 
                    <input 
                        type="file" 
                        name=""
                        className="size-full cursor-pointer absolute z-[10] top-0 left-0 opacity-0"
                        onChange={(e) => handleLandingPageImageChange(e,2)}
                    />
                </div>
            </div>
            )
        }
      
    }

    return (
        <div className="w-full min-h-svh flex items-center justify-center overflow-y-scroll">
            <div
              className={`absolute top-5 right-20 flex items-center cursor-pointer w-14 h-8 rounded-full p-1 duration-300 ease-in-out ${
                  newProduct.active ? `bg-green-400` : 'bg-gray-300'
              }`}
              onClick={()=>{
                setNewProduct({...newProduct,active: !newProduct.active})
              }}
            >
                <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${
                    newProduct.active ? 'translate-x-6' : ''
                    }`}
                />
            </div>
            <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-5 bg-white p-8 rounded-lg shadow-md">

                {isImages &&
                    <div className="text-center text-red-500 font-medium text-lg">
                        Enter An on and off Images
                    </div>
                }

                <div className="flex items-center justify-between relative w-full mb-10">
                    <input
                        className="imageOn w-96 h-96 bg-white hover:bg-gray-200 hover:text-gray-200 text-white mr-5 rounded-full border-dashed cursor-pointer border-black border-2"
                        type="file"
                        label="imageOn"
                        name="imageOn"
                        onChange={(e) => handleFileUpload(e, 'On')}
                    />
                    {newProduct.imageOn
                        ? <img alt="" src={newProduct.imageOn} width={96} height={96} className='absolute rounded-full w-96 h-96 object-cover pointer-events-none' />
                        : <div className='absolute left-32 font-bold text-xl pointer-events-none'>
                            <p>Enter imge on</p>
                            <FontAwesomeIcon icon={faCloudArrowUp} className="ml-12" />
                        </div>
                    }
                    <input
                        className="imageOff w-96 h-96 bg-white hover:bg-gray-200 hover:text-gray-200 text-white ml-5 rounded-full border-dashed cursor-pointer border-black border-2"
                        type="file"
                        label="imageOff"
                        name="imageOff"
                        onChange={(e) => handleFileUpload(e, 'Off')}
                    />
                    {newProduct.imageOff
                        ? <img alt="" src={newProduct.imageOff} width={96} height={96} className='absolute rounded-full w-96 h-96 object-cover pointer-events-none right-0' />
                        : <div className='absolute right-32 font-bold text-xl pointer-events-none'>
                            <p>Enter imge off</p>
                            <FontAwesomeIcon icon={faCloudArrowUp} className="ml-12" />
                        </div>
                    }
                </div>
                <div className="text-center">
                    <h1 className="font-semibold text-xl"> Gallery</h1>
                    <div className="grid grid-cols-4 gap-8 justify-between my-10">
                        {galleryElemnt}
                        <div className="border-dashed flex justify-center items-center text-7xl text-gray-500 w-40 h-40 cursor-pointer relative border-black border-2">
                            <input
                                type='file'
                                className='opacity-0 w-40 h-40 top-0 left-0 absolute'
                                onChange={handleAddToGallery}
                            />
                            <span>+</span>
                        </div>
                    </div>
                </div>

                <input
                    className='border-2 border-gray-400 rounded-md p-4'
                    required
                    placeholder="Title"
                    type="text"
                    label="Title"
                    name="title"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct(pre => ({ ...pre, title: e.target.value }))}
                />
                <input
                    className='border-2 border-gray-400 rounded-md p-4'
                    required
                    placeholder="Price"
                    type="price"
                    label="Price"
                    name="price"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(pre => ({ ...pre, price: e.target.value }))}
                />
                <textarea
                    required
                    ref={textareaRef}
                    placeholder="Description"
                    type='text'
                    label="description"
                    name="description"
                    className="border-2 border-gray-400 rounded-md p-2 pb-10 resize-y w-full min-h-[200px]"
                    value={newProduct.description}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setNewProduct(pre => ({ ...pre, description: e.target.value }))}
                />
                <div className="text-center">
                    <h1 className="font-semibold text-xl"> Options </h1>
                    {optionsElemnt}
                    <div
                        className="mt-6 bg-stone-500 px-4 py-3 text-white rounded-3xl max-w-40 m-auto cursor-pointer"
                        onClick={handleAddOption}
                    >
                        Add option
                    </div>
                </div>
                <div className="text-center">
                    <h1 className="font-semibold text-xl"> Sales </h1>
                    {salesElemnt}
                    <div
                        className="mt-6 bg-stone-500 px-4 py-3 cursor-pointer text-white rounded-3xl max-w-40 m-auto"
                        onClick={handleAddSale}
                    >
                        Add sale
                    </div>
                </div>
                <div className="text-center relative">
                    <div
                        className="size-full absolute top-0 right-0"
                        onClick={() => setIsRewMates([])}
                    ></div>

                    <h1 className="font-semibold text-xl"> Parts </h1>

                    {partsElemnt}

                    <div
                        className="mt-6 bg-stone-500 px-4 z-20 relative py-3 cursor-pointer text-white rounded-3xl max-w-40 m-auto"
                        onClick={handleAddPart}
                    >
                        Add a part
                    </div>

                </div>
                <div className="text-center">
                    <h1 className="font-semibold text-xl"> DropDowns </h1>
                    {dropDownsElement}
                    <div
                        className="mt-6 bg-stone-500 px-4 py-3 cursor-pointer text-white rounded-3xl max-w-40 m-auto"
                        onClick={handleAddDropDown}
                    >
                        Add a dropDown
                    </div>
                </div>
                <div className="text-center">
                    <h1 className="font-semibold text-xl mb-4"> Landing Page </h1>

                    {usingLandingPage &&langingPgesElement()}
                    <div
                        className="mt-6 bg-stone-500 px-4 py-3 cursor-pointer text-white rounded-3xl w-max m-auto"
                        onClick={() => {
                            setUsingLandingPage(pre=>!pre)
                            if(usingLandingPage)setNewProduct(pre=>({...pre,landingPageImages:[]}))
                        }}
                    >
                        {usingLandingPage?'Remove Landing Page':'Use Landing Page'}                     
                    </div>

                </div>
                <button
                    type="submit"
                    className={`p-4 bg-gray-900 text-white ${isSubmiting && 'h-16 flex justify-center items-start'}`}
                >
                    {isSubmiting
                        ? <Spinner color={'border-gray-500'} size={'h-10 w-10 '} />
                        : 'Submit'
                    }
                </button>
            </form>
        </div>
    );
}

export default ProductUpdate;
