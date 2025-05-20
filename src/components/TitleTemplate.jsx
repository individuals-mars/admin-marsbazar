import React from 'react'

const TitleTemplate = ({title, description}) => {
  return (
    <div>
        <h1 className='text-xl font-bold'>{title}</h1>
        <p>{description}</p>
    </div>
  )
}

export default TitleTemplate