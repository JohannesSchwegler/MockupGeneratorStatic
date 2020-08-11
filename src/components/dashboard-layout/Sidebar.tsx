import React, { ReactNode } from 'react'
import s from "./Sidebar.scss"

interface SidebarProps {
    children: ReactNode;
}
export default function Sidebar({ children }: SidebarProps) {
    return (
        <div className={s.sidebar}>
            {children}
        </div>
    )
}
