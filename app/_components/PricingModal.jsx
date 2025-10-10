import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PricingTable } from '@clerk/nextjs'

function PricingModal({children}) {
  return (
    <Dialog>
  <DialogTrigger asChild>
   <div className='w-full'> {children}</div> 
    </DialogTrigger>
  <DialogContent className={'min-w-4xl'}>
    <DialogHeader>
      <DialogTitle>Upgrade Plane</DialogTitle>
      <DialogDescription>
        <PricingTable />
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
  )
}

export default PricingModal
