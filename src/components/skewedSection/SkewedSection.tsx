import React, { ReactNode } from 'react'
import s from "./SkewedSection.scss"

interface SkewedSectionProps {
    children: ReactNode
}

export default function SkewedSection({ children }: SkewedSectionProps) {
    return (
        <section className={s.skewed}>
            <div className={s.skewed__inner}>
                {children}
            </div>
        </section>
    )
}
