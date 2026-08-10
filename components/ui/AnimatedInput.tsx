'use client'

import React, { useState, useId } from 'react'
import { UseFormRegisterReturn } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'

interface AnimatedInputProps {
  id: string
  label: string
  type?: 'text' | 'email' | 'password'
  register: UseFormRegisterReturn
  icon?: React.ReactNode
  error?: string
}

export function AnimatedInput({ id, label, type = 'text', register, icon, error }: AnimatedInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type
  const uid = useId().replace(/:/g, '') // Generate unique ID for CSS scoping

  return (
    <div className="w-full mb-6">
      <style>{`
        .input-wave-${uid} span {
          transition: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .peer-wave-${uid}:focus ~ .input-wave-${uid} span,
        .peer-wave-${uid}:not(:placeholder-shown) ~ .input-wave-${uid} span {
          color: white;
          transform: translateY(-36px) scale(0.85);
        }
        .peer-wave-${uid}:focus ~ .icon-wave-${uid},
        .peer-wave-${uid}:not(:placeholder-shown) ~ .icon-wave-${uid} {
          color: white;
        }
      `}</style>
      
      <div className="relative group w-full mt-8">
        <input 
          {...register}
          type={inputType}
          id={id}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`peer-wave-${uid} w-full h-14 bg-black/40 border border-white/20 focus:border-white focus:bg-black/60 transition-all duration-300 rounded-2xl px-5 text-[15px] text-white outline-none focus:ring-4 focus:ring-white/10 backdrop-blur-md shadow-inner font-medium`}
        />
        
        {/* Animated Wave Label */}
        <label 
          htmlFor={id}
          className={`input-wave-${uid} absolute left-5 top-[15px] pointer-events-none flex text-[14px] font-bold uppercase tracking-wider`}
        >
          {label.split('').map((char, i) => (
            <span 
              key={i} 
              className="inline-block text-white/50 origin-left"
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </label>

        {/* Optional Icon Slot (Right aligned) */}
        {icon && !isPassword && (
          <div className={`icon-wave-${uid} absolute right-5 top-1/2 -translate-y-1/2 text-white/50 transition-colors duration-300`}>
            {icon}
          </div>
        )}

        {/* Password Eye Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className={`icon-wave-${uid} absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/10 active:scale-[0.97] transition-all duration-200 text-white/50`}
          >
            {showPassword ? (
              <EyeOff className="w-[20px] h-[20px] hover:text-white transition-colors" strokeWidth={1.5} />
            ) : (
              <Eye className="w-[20px] h-[20px] hover:text-white transition-colors" strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-red-400 font-semibold mt-2 ml-1">
          {error}
        </p>
      )}
    </div>
  )
}
