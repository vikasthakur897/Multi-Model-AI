import React from 'react'

function ChatInputBox() {
  return (
    <div className='relative min-h-screen'>
      <div>

      </div>

      <div className='fixed bottom-0 left-0 w-full flex justify-center px-4 pb-4'>
        <div className='w-full border rounded-xl shadow-md max-w-2xl p-4'>
            <input type="text" className="border-0 outline-none" placeholder="Ask me anything...." />

        </div>
      </div>
    </div>
  )
}

export default ChatInputBox
