'use client'
import React from 'react'
import dynamic from 'next/dynamic'
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const VideoPlayer = () => {
  return (
    <div className="container mx-auto mt-8">
      <ReactPlayer
        width="1280px"
        height="720px"
        url="https://www.youtube.com/watch?v=UZtwfVhZzdo&ab_channel=AkshatShrivastava"
        //  url="https://hhld-classes.s3.ap-south-1.amazonaws.com/Day+9.mp4"
        controls={true}
      />
    </div>
  )
}

export default VideoPlayer