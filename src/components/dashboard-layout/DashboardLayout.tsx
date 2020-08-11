import React, { ReactNode } from 'react'
import s from "./DashboardLayout.scss"
import {Container} from "../container/Container"

interface DashboardProps {
    children: ReactNode;
}
export default function DashboardLayout({ children }: DashboardProps) {
    return (
        <Container>

            <div className={s.dashboard}>
                {children}
            </div>
        </Container>

    )
}
