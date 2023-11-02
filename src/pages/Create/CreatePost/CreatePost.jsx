import { useAuth, supabase } from '../../../auth/Auth'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { useNavigate } from "react-router-dom"

const CreatePost = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [files, setFiles] = useState([])
  const [caption, setCaption] = useState('')
  const errorMessages = []
  var urlList = []
  
  var postId = 0

  {/** Drag and Drop functionality */}
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (acceptedFiles?.length) {
      setFiles(previousFiles => [
        ...previousFiles,
        ...acceptedFiles.map(file =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
          )
      ])
    }
    
    {/** Rejected Files error handling. Shows alert with reject file and reason for rejection */}
    if (rejectedFiles?.length) {
      rejectedFiles.forEach(({ file, errors })=> {
        errorMessages.push(`FILE REJECTED: ${file.name} \n`)
        errors.forEach(error => {
          errorMessages.push(error.message)
        })
      })
      const errorMessage = errorMessages.join('\n')
      alert(errorMessage)
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

  {/** Remove file from preview */}
  const removeFile = (fileName) => {
    setFiles(files => files.filter(file => file.name !== fileName))
  }

  {/** Submit post to database */}
  const handleSubmit = async (e) => {
    e.preventDefault()

    {/** Check if all form values are filled in */}
    if (!files?.length) {
      alert('Please select at least one file to upload.')
      return
    }
    else if (!caption) {
      alert('Please enter a caption for your post.')
      return
    }
    
    {/** Insert post into database */}
    const { data: postData, error: postError } = await supabase
    .from('posts')
    .insert([{ user_id: user.id , caption: caption }])
    .select()

    if (postError) {
      console.log(postError)
    }
    if (postData) {
      postId = postData[0].post_id
      navigate('/')
    }

    {/** Upload files to storage */}
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(`Upload/${user.id}/${postId}`)
        .upload(`./${file.name}`, file)
      
      if (uploadError) {
        console.log(uploadError)
      }

      {/** If file uploaded successfully, get file url from storage */}
      if (uploadData) {
        const { data: urlData } = await supabase
        .storage
        .from('Upload')
        .getPublicUrl(`${user.id}/${postId}/${file.name}`)
        urlList.push(urlData.publicUrl)

        {/** If this is the last file in the loop, update post with the list of file urls */}
        if (index === (files.length - 1)) {
          const { error } = await supabase
            .from('posts')
            .update([{ file_url: urlList }])
            .eq('post_id', postId)

          if (error) {
            console.log(error)
          }
        }
      }
    } 

    setFiles([])
    setCaption('')
    urlList = []
  }

  return (
    <main className="ml-0 md:ml-64">
      <form className="p-9 w-full" onSubmit={handleSubmit}>
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
        
        {files.length > 0 && (
          <h3 className='title text-lg font-semibold text-white mt-10 border-b pb-3'>
            Accepted Files
          </h3>
        )}
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
                className="w-7 h-7 border rounded-full flex justify-center items-center absolute -top-3 -right-3 bg-red-400 hover:bg-neutral-400 transition-colors"
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

        <textarea 
          className="w-full h-1/4 mt-10 text-black p-2"
          placeholder='Enter the caption for your post'
          value={caption}
          onChange={e => setCaption(e.target.value)}
          >
        </textarea>
        <div className="flex justify-center">
          <button
            type="submit"
            className="mt-3 text-md uppercase tracking-wider font-bold text-black border rounded-md px-3 py-2 mb-8 bg-neutral-400 hover:bg-neutral-500 transition-colors"
          >
            Upload
          </button>
        </div>
        
      </form>
    </main>
  )
}

export default CreatePost