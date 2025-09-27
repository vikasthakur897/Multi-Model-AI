import React from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Sidebar, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

function Provider({
    children,
    ...props
}) {
  return (

    <NextThemesProvider 
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
    {...props}>{children}
    <SidebarProvider>
      <SidebarTrigger />
    <div>
       {children}
    </div>
    </SidebarProvider>
    </NextThemesProvider>
  )
}

export default Provider
