import { useAuth, supabase } from '../../../auth/Auth'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import '../../../styles/createPost.css'

const CreatePost = () => {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [rejected, setRejected] = useState([])
  const [caption, setCaption] = useState('')

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (acceptedFiles?.length) {
      setFiles(previousFiles => [
        ...previousFiles,
        ...acceptedFiles.map(file =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
          )
      ])
    }
    
    if (rejectedFiles?.length) {
      setRejected(previousFiles => [...previousFiles, ...rejectedFiles])
    }
  }, [])

  const {getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
    'image/*': [],
    'video/*': []
  },
  maxSize: 10485760,
})

  const removeFile = (fileName) => {
    setFiles(files => files.filter(file => file.name !== fileName))
  }

  const removeRejected = name => {
    setRejected(files => files.filter(({ file }) => file.name !== name))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!files?.length) {
      alert('Please select at least one file to upload.')
      return
    }
    else if (!caption) {
      alert('Please enter a caption for your post.')
      return
    }

    files.forEach(file => {
      const {data, error } = supabase.storage
      .from(`Upload/${user.id}`)
      .upload(`./${file.name}`, file)
      if (data) {
        console.log(data)
      } else {
        console.log(error)
      }
    })
  }

  return (
    <form className="w-4/5 m-8" onSubmit={handleSubmit}>
      <div className="text-3xl font-bold text-center">Create a Post</div>
      <div {...getRootProps({
        className: 'p-16 mt-10 border border-neutral-200'
      })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop files here ...</p>
        ) : (
          <p className="text-center"> Drag and drop some files here, or click to select files</p>
        )}
      </div>

      <h3 className='title text-lg font-semibold text-white mt-10 border-b pb-3'>
        Accepted Files
      </h3>
      {/** Preview */}

      <ul className="mt-6 grid grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-10">
        {files.map(file => (
          <li key={file.name} className="relative rounded-md">
            {file.type.startsWith('image') ? (
              <img 
              src={file.preview}
              alt=''
              onLoad={() => {
                URL.revokeObjectURL(file.preview)
              }}
              className="h-auto w-full object-cover rounded-md"
              />
            ) : (
              <video
              src={file.preview}
              className="h-auto w-full object-cover rounded-md"
              />
            )}
            
            <button 
              type="button"
              className="w-7 h-7 border rounded-full flex justify-center items-center absolute -top-3 -right-3 bg-red-400 hover:bg-gray-400 transition-colors"
              onClick={() => removeFile(file.name)}
            >
              <XMarkIcon className="w-5 h-5 fill-white hover:fill-secondary-400 transition-colors" />
            </button>
            <p className="mt-2 text-white text-[12px] font-medium">
              {file.name}
            </p>
            </li>
        ))}
      </ul>
      
      {/** Rejected Files */}
      <h3 className="title text-lg font-semibold text-white mt-24 border-b pg-3">
        Rejected Files
      </h3>
      <ul className="mt-6 flex flex-col">
        {rejected.map(({ file, errors })=> (
          <li key={file.name} className='flex items-start justify-between'>
            <div>
              <p className="mt-2 text-white text-sm font-medium">
                {file.name}
              </p>
              <ul className="text-[12px] text-red-400">
                {errors.map(error => (
                  <li key={error.code}>{error.message}</li>
                ))}
              </ul>
            </div>
            <button 
              type="button"
              className="mt-1 py-1 text-[12px] uppercase tracking-wider font-bold text-white border rounded-md px-3 hover:text-white bg-red-400 hover:bg-gray-400 transition-colors"
              onClick={() => removeRejected(file.name)}
            >
              remove
            </button>
          </li>
        ))}
      </ul>
      <textarea 
        className="w-full h-1/4 mt-10 text-black p-2"
        placeholder='Enter the caption for your post'
        onChange={e => setCaption(e.target.value)}
        >
      </textarea>
      <div className="flex justify-center">
        <button
          type="submit"
          className="mt-3 text-md uppercase tracking-wider font-bold text-black border rounded-md px-3 py-2 mb-8 bg-gray-400 hover:bg-gray-500 transition-colors"
        >
          Upload
        </button>
      </div>
      
    </form>
  )
}

export default CreatePost

{/* 
export default function CreatePost() {
  const { user } = useAuth()
  console.log(user.id)

  const handleChange = async (file) => {
    const {data, error} =  await supabase.storage
    .from(`Upload/${user.id}`)
    .upload(`./${file.name}`, file);
    if (data) {
      console.log(data)
    } else {
      console.log(error)
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault()
  }

  return (
    <>
    <div className="flex flex-col w-4/5 container">
      <div className="title">Create Post</div>
      <div className="subtitle">Upload a file and write a caption to create a post</div>
      <form onSubmit={handleSubmit} className="createPostForm mt-10">
        <FileUploader className="upload" style="display: block;"
            multiple={true}
            handleChange={(file) => handleChange(file)}
            name="file-uploader"
            types={fileTypes}
          />
          <textarea className="caption w-full h-3/4 mt-5 text-black"></textarea>
      </form> 
    </div>
    
    </>
  );
} */}