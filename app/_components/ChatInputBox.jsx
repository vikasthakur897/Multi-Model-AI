import { Button } from '@/components/ui/button'
import { Mic, Paperclip, Send } from 'lucide-react'
import React from 'react'

function ChatInputBox() {
  return (
    <div className='relative min-h-screen'>
      <div>

      </div>

      <div className='fixed bottom-0 left-0 w-full flex justify-center px-4 pb-4'>
        <div className='w-full border rounded-xl shadow-md max-w-2xl p-4'>
            <input type="text" className="border-0 outline-none" placeholder="Ask me anything...." />
            <div className='mt-3 flex justify-between items-center'>
              <Button  className={''} size={'icon'} variant={'ghost'}>
                <Paperclip className='h-5 w-5' />
              </Button>
              <div className='flex gap-5'>
                <Button size={'icon'} variant={'ghost'}><Mic /> </Button>
                <Button size={'icon'} className={'bg-gray-500 text-white'} ><Send /> </Button>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInputBox
