import React, { useEffect, useRef } from 'react'

const VideoBackground = () => {
  const videoRef = useRef(null)

  useEffect(() => {
    // This is the magic for the "Slow Motion" effect
    if (videoRef.current) {
      // 1.0 is normal speed. 0.4 plays it at 40% speed for a cinematic, slow-motion feel.
      videoRef.current.playbackRate = 0.6
    }
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
      
      {/* The Video Player
        autoPlay: Starts immediately
        loop: Loops infinitely
        muted & playsInline: REQUIRED by browsers to auto-play videos without user interaction
      */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/RC_Aviation_Hobby_Montage.mp4" type="video/mp4" />
      </video>

      {/* Premium Overlay System 
        This darkens the video and applies a slight blue tint to match your aviation theme,
        ensuring that the bright parts of the video don't hide your white text.
      */}
      <div className="absolute inset-0 bg-aviation-darker/60 mix-blend-multiply backdrop-blur-[2px]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-aviation-darker/90 via-transparent to-aviation-darker/90"></div>
    </div>
  )
}

export default VideoBackground