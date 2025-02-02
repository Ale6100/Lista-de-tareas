import { useState, useRef, useEffect } from "react"
import { ordenarCategorias } from "../../utils"
import { loadingToast, sendToast, sendToastUpdate } from "../../utils/toast"
import { disableButton, enableButton } from "../../utils/disabledButton"
import { NoteType } from "../../types/note"
import { UserInterface } from "../../types/user"
import { checkLogger } from "../../utils/checkLogger"
import getUser from "../../utils/getUser"

const AddCategoryForm = () => {
    return (
        <>
        <label htmlFor="form-title" className="text-center block text-white text-xl font-bold mb-2">Título</label>
        <input autoComplete="off" required type="text" id="form-title" name="form-title" className="text-center shadow border rounded w-full py-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>

        <button type="submit" className='w-full mx-auto py-2 px-4 items-center text-black font-semibold bg-green-500 hover:bg-green-700 active:bg-green-600 rounded'>Agregar</button>
        </>
    )
}

const AddCategory = ({ setNotas, user, setUser }: { setNotas: React.Dispatch<React.SetStateAction<NoteType[]>>, user: UserInterface | null, setUser: React.Dispatch<React.SetStateAction<UserInterface | null>> }) => {
    const [ formOpen, setFormOpen ] = useState(false)

    const noteRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        const divNote = noteRef.current

        if (divNote) {
            if (formOpen) {
                divNote.classList.remove("hidden")

            } else {
                divNote.classList.add("hidden")
            }
        }
    }, [formOpen])

    const addCategory = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const button = e.currentTarget.lastChild

        if (!(button instanceof HTMLButtonElement)) {
            return sendToast("error", "Error interno")
        }

        disableButton(button)

        const connected = await checkLogger(getUser, setUser)
        if (!connected) return null

        const title = formData.get("form-title")?.toString().trim();

        if (!title || typeof title !== "string") {
            return sendToast("error", "Por favor, escribe un título para la nueva categoría")
        }

        const idToast = loadingToast("Espere....");

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notes/category/${user?._id}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title })
        })

        const json = await res.json()

        if (json.status === "success") {
            sendToastUpdate(idToast, "success", "Nueva categoría agregada!")
            setFormOpen(false)
            setNotas(notas => {

                if (user) {
                    const newArray = [...notas, { _id: json.payload.id, title, items: [], timestamp: json.payload.timestamp }]
                    return ordenarCategorias(newArray, user.orderCategories)
                } else {
                    return []
                }
            })

        } else if (json.status === "error" && res.status !== 500) {
            sendToastUpdate(idToast, "error", json.error)
            enableButton(button)

        } else {
            console.error("Error interno")
        }
    }

    return (
        <div className="flex flex-col">
            <button onClick={() => setFormOpen(!formOpen)} className='w-56 mx-auto py-2 px-4 flex justify-between items-center bg-gray-300 hover:bg-gray-400 hover:text-white active:bg-gray-500 rounded'>
                <p className='text-center w-full text-black'>{ formOpen ? "Cancelar" : "Agregar categoría" }</p>
                <img loading="lazy" className='h-10' src={`./img/${ formOpen ? "cancelAddCategory.svg" : "addCategory.svg"}`} alt="Icon add note" />
            </button>

            <form ref={noteRef} onSubmit={addCategory} className="divAddCategory mt-2 mx-auto p-2 h-40 flex flex-col justify-around border-blue-300 border rounded-sm">
                {
                    formOpen && <AddCategoryForm />
                }
            </form>
        </div>
    )
}

export default AddCategory
