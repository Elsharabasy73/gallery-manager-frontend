import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { signup as signupApi, login as loginApi, sendVerificationOtp, verifyEmail as verifyEmailApi, forgotPassword, verifyResetOtp, resetPassword } from '../api/auth'
import { useRole } from '../context/RoleContext'

function SplitLayout({ children }){
  return (
    <div className="grid md:grid-cols-2 bg-white border border-[#E7DFD3] rounded-xl overflow-hidden max-w-5xl mx-auto">
      <div className="hidden md:block bg-cover bg-center p-8 flex flex-col justify-end text-white" style={{backgroundImage:"url('https://images.unsplash.com/photo-1616046229478-9901c5536daa?auto=format&fit=crop&w=900&q=80')"}}>
        <div className="bg-[#4B3621]/80 backdrop-blur p-6 rounded-xl">
          <div className="font-serif text-2xl mb-2">Atelier Gallery</div>
          <p className="text-sm text-white/80">Where galleries meet discerning homes. Warm, trusted, handcrafted.</p>
        </div>
      </div>
      <div className="p-8">{children}</div>
    </div>
  )
}
export function Login(){
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useRole()
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(location.state?.justVerified ? '' : (location.state?.justSignedUp ? 'Account created — please log in.' : ''))

  const handleLogin = async ()=>{
    setError('')
    if(!email.trim() || !password){ setError('Please enter email and password.'); return }
    setLoading(true)
    try{
      const res = await loginApi({ email: email.trim(), password })
      // backend returns { status, data: user, token } — store JWT
      if(res?.token) localStorage.setItem('token', res.token)
      if(res?.data) localStorage.setItem('user', JSON.stringify(res.data))
      if(setAuth && res?.data) setAuth(res.data, res.token)
      navigate('/', { replace: true })
    }catch(e){
      // if backend says email not verified, redirect to OTP
      if(e.status === 403 && /not verified|verify/i.test(e.message)){
        try{ await sendVerificationOtp(email.trim()) }catch{}
        navigate('/otp', { state: { email: email.trim() } })
        return
      }
      setError(e.message || 'Login failed')
    }finally{ setLoading(false) }
  }

  return <SplitLayout>
    <h2 className="font-serif text-2xl mb-1">Welcome back</h2><p className="text-xs text-[#8A8078] mb-6">Log in to continue</p>
    {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-3">{error}</div>}
    {location.state?.resetSuccess && <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2 mb-3">Password reset successfully — please log in with your new password.</div>}
    {location.state?.justVerified && <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2 mb-3">Email verified — please log in.</div>}
    {location.state?.justSignedUp && !error.includes('created') && <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2 mb-3">Account created successfully.</div>}
    <div className="space-y-3">
      <div><label className="text-xs font-medium">Email</label><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border border-[#E7DFD3] rounded-lg px-3 py-2 mt-1 text-sm" placeholder="you@example.com" /></div>
      <div><label className="text-xs font-medium">Password</label><div className="relative"><input type={showPw ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=> e.key==='Enter' && handleLogin()} className="w-full border border-[#E7DFD3] rounded-lg px-3 py-2 mt-1 text-sm pr-10" placeholder="••••••••" /><button type="button" onClick={()=>setShowPw(v=>!v)} className="material-symbols-outlined absolute right-2 top-3 text-[18px] text-[#8A8078]">{showPw ? 'visibility_off' : 'visibility'}</button></div></div>
      <button onClick={handleLogin} disabled={loading} className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm font-medium mt-2 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Logging in...' : 'Log in'}</button>
      <div className="flex justify-between text-xs"><button onClick={()=>navigate('/forgot-password')} className="text-[#C19A6B]">Forgot password?</button><button onClick={()=>navigate('/signup')} className="text-[#4B3621] font-medium">Create account</button></div>
    </div>
  </SplitLayout>
}
export function Signup(){
  const navigate = useNavigate()
  const [role,setRole]=useState('customer')
  const [firstName,setFirstName]=useState('')
  const [lastName,setLastName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [passwordConfirm,setPasswordConfirm]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [fieldErrors,setFieldErrors]=useState({})

  const handleSubmit = async ()=>{
    setError('')
    setFieldErrors({})
    if(!firstName.trim() || !lastName.trim() || !email.trim() || !password || !passwordConfirm){
      setError('Please fill all required fields.')
      return
    }
    if(password !== passwordConfirm){
      setError('Passwords do not match.')
      return
    }
    if(password.length < 6){
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try{
      const res = await signupApi({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password, passwordConfirm, role })
      const emailToVerify = res.data?.email || email.trim()
      // trigger OTP for email verification — required before accessing homepage
      try {
        await sendVerificationOtp(emailToVerify)
      } catch (otpErr) {
        // non-blocking: still redirect to OTP page so user can retry resend
        console.warn('sendVerificationOtp after signup failed:', otpErr?.message)
      }
      navigate('/otp', { state: { email: emailToVerify, fromSignup: true } })
    }catch(e){
      if(e.details){
        const fe = {}
        e.details.forEach(d=>{ if(d.path) fe[d.path]=d.msg })
        setFieldErrors(fe)
        setError(e.message || 'Validation failed')
      } else {
        setError(e.message || 'Signup failed')
      }
    }finally{ setLoading(false) }
  }

  const errFor = (f)=> fieldErrors[f] ? <div className="text-[11px] text-red-600 mt-1">{fieldErrors[f]}</div> : null

  return <SplitLayout>
    <h2 className="font-serif text-2xl mb-1">Create account</h2><p className="text-xs text-[#8A8078] mb-4">Choose your role to get started</p>
    <div className="grid grid-cols-3 gap-2 mb-4">
      {[
        {id:'customer', label:'Customer', desc:'Browse & order'},
        {id:'gallery_owner', label:'Gallery Owner', desc:'Open gallery'},
        {id:'craftsman', label:'Craftsman', desc:'Join as maker'},
      ].map(r=>(
        <button key={r.id} onClick={()=>setRole(r.id)} className={`border rounded-lg p-3 text-left ${role===r.id?'border-[#4B3621] bg-[#FAF7F2]':'border-[#E7DFD3]'}`}>
          <div className="text-xs font-semibold">{r.label}</div><div className="text-[11px] text-[#8A8078]">{r.desc}</div>
        </button>
      ))}
    </div>
    {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-3">{error}</div>}
    <div className="grid grid-cols-2 gap-3">
      <div><label className="text-xs">First name*</label><input value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />{errFor('firstName')}</div>
      <div><label className="text-xs">Last name*</label><input value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />{errFor('lastName')}</div>
      <div className="col-span-2"><label className="text-xs">Email*</label><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" placeholder="you@example.com" />{errFor('email')}</div>
      <div className="col-span-2"><label className="text-xs">Password* (min 6)</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />{errFor('password')}</div>
      <div className="col-span-2"><label className="text-xs">Confirm password*</label><input type="password" value={passwordConfirm} onChange={e=>setPasswordConfirm(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />{errFor('passwordConfirm')}{errFor('role')}</div>
    </div>
    <button onClick={handleSubmit} disabled={loading} className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm font-medium mt-4 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Creating...' : 'Create account'}</button>
    <div className="text-xs text-center mt-3">Already have account? <button onClick={()=>navigate('/login')} className="text-[#C19A6B]">Log in</button></div>
  </SplitLayout>
}
export function Otp(){
  const navigate = useNavigate()
  const location = useLocation()
  const initialEmail = location.state?.email || ''
  const [email, setEmail] = useState(initialEmail)
  const [editingEmail, setEditingEmail] = useState(!initialEmail)
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [info, setInfo] = useState(initialEmail ? `We sent a code to ${initialEmail}` : '')
  const [cooldown, setCooldown] = useState(initialEmail ? 120 : 0)
  const inputsRef = useRef([])

  useEffect(()=>{
    if(cooldown<=0) return
    const t = setTimeout(()=> setCooldown(c=>c-1), 1000)
    return ()=> clearTimeout(t)
  }, [cooldown])

  useEffect(()=>{
    if(initialEmail && !editingEmail) inputsRef.current[0]?.focus()
  }, [initialEmail, editingEmail])

  const handleChange = (idx, val)=>{
    if(!/^\d*$/.test(val)) return
    const digit = val.slice(-1)
    const next = [...otp]
    next[idx]=digit
    setOtp(next)
    setError('')
    if(digit && idx<5) inputsRef.current[idx+1]?.focus()
  }
  const handleKeyDown = (idx, e)=>{
    if(e.key==='Backspace' && !otp[idx] && idx>0) inputsRef.current[idx-1]?.focus()
    if(e.key==='ArrowLeft' && idx>0) inputsRef.current[idx-1]?.focus()
    if(e.key==='ArrowRight' && idx<5) inputsRef.current[idx+1]?.focus()
  }
  const handlePaste = (e)=>{
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    if(!pasted) return
    const next = Array(6).fill('')
    pasted.split('').forEach((d,i)=> next[i]=d)
    setOtp(next)
    const focusIdx = Math.min(pasted.length,5)
    inputsRef.current[focusIdx]?.focus()
  }
  const handleResend = async ()=>{
    if(!email.trim()){ setError('Please enter your email first.'); setEditingEmail(true); return }
    if(cooldown>0) return
    setResending(true)
    setError('')
    setInfo('')
    try{
      await sendVerificationOtp(email.trim())
      setInfo(`Verification code resent to ${email.trim()}`)
      setCooldown(120)
    }catch(e){
      setError(e.message || 'Failed to resend code')
    }finally{ setResending(false) }
  }
  const handleVerify = async ()=>{
    const code = otp.join('')
    if(code.length!==6){ setError('Please enter the 6-digit code.'); return }
    if(!email.trim()){ setError('Missing email. Please enter your email.'); setEditingEmail(true); return }
    setLoading(true)
    setError('')
    setSuccess('')
    try{
      await verifyEmailApi({ email: email.trim(), otp: code })
      // login is the only endpoint that returns JWT — show success then redirect to login
      setSuccess('Email verified successfully! Redirecting to login...')
      setInfo('')
      setTimeout(()=>{
        navigate('/login', { state: { email: email.trim(), justVerified: true }, replace: true })
      }, 1500)
    }catch(e){
      setError(e.message || 'Invalid or expired code.')
    }finally{ setLoading(false) }
  }

  return <SplitLayout>
    <h2 className="font-serif text-xl mb-1">Verify your email</h2>
    {editingEmail ? (
      <div className="mb-4">
        <label className="text-xs font-medium">Email</label>
        <div className="flex gap-2 mt-1">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 border border-[#E7DFD3] rounded-lg px-3 py-2 text-sm" />
          <button onClick={()=>{ if(email.trim()){ setEditingEmail(false); setInfo(`We sent a code to ${email.trim()}`); setCooldown(120)} }} className="px-4 py-2 bg-[#4B3621] text-white rounded-lg text-xs whitespace-nowrap">Done</button>
        </div>
      </div>
    ) : (
      <p className="text-xs text-[#8A8078] mb-4">We sent a code to <span className="font-medium text-[#4B3621]">{email}</span> <button onClick={()=>setEditingEmail(true)} className="text-[#C19A6B] ml-1">Change</button></p>
    )}
    {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-3">{error}</div>}
    {success && <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2 mb-3">{success}</div>}
    {info && !error && !success && <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2 mb-3">{info}</div>}
    <div className="flex gap-2 justify-center my-6" onPaste={handlePaste}>
      {Array.from({length:6}).map((_,i)=><input key={i} ref={el=>inputsRef.current[i]=el} value={otp[i]} onChange={e=>handleChange(i, e.target.value)} onKeyDown={e=>handleKeyDown(i,e)} maxLength={1} inputMode="numeric" className="w-10 h-12 border border-[#E7DFD3] rounded-lg text-center text-lg font-medium focus:ring-2 focus:ring-[#C19A6B] outline-none" />)}
    </div>
    <button onClick={handleVerify} disabled={loading} className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Verifying...' : 'Verify'}</button>
    <div className="text-xs text-center mt-3 text-[#8A8078]">
      Didn't receive?{' '}
      {cooldown>0 ? <span>Resend in {Math.floor(cooldown/60)}:{String(cooldown%60).padStart(2,'0')}</span> : <button onClick={handleResend} disabled={resending} className="text-[#C19A6B] disabled:opacity-50">{resending ? 'Sending...' : 'Resend code'}</button>}
    </div>
  </SplitLayout>
}
export function ForgotPassword(){
  const navigate = useNavigate()
  const [step,setStep]=useState(1)
  const [email,setEmail]=useState('')
  const [otp,setOtp]=useState(Array(6).fill(''))
  const [newPassword,setNewPassword]=useState('')
  const [confirmPassword,setConfirmPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [resending,setResending]=useState(false)
  const [error,setError]=useState('')
  const [info,setInfo]=useState('')
  const [success,setSuccess]=useState('')
  const [cooldown,setCooldown]=useState(0)
  const inputsRef=useRef([])

  useEffect(()=>{
    if(cooldown<=0) return
    const t=setTimeout(()=>setCooldown(c=>c-1),1000)
    return ()=>clearTimeout(t)
  },[cooldown])

  useEffect(()=>{
    if(step===2) inputsRef.current[0]?.focus()
  },[step])

  const handleSendCode = async()=>{
    setError(''); setInfo(''); setSuccess('')
    if(!email.trim()){ setError('Please enter your email.'); return }
    setLoading(true)
    try{
      await forgotPassword(email.trim())
      setInfo(`Reset code sent to ${email.trim()}`)
      setCooldown(120)
      setStep(2)
    }catch(e){ setError(e.message || 'Failed to send code') }finally{ setLoading(false) }
  }
  const handleResend = async()=>{
    if(cooldown>0) return
    if(!email.trim()){ setError('Missing email.'); return }
    setResending(true); setError(''); setInfo('')
    try{
      await forgotPassword(email.trim())
      setInfo(`Reset code resent to ${email.trim()}`)
      setCooldown(120)
    }catch(e){ setError(e.message || 'Failed to resend') }finally{ setResending(false) }
  }
  const handleChangeOtp = (idx,val)=>{
    if(!/^\d*$/.test(val)) return
    const d=val.slice(-1)
    const next=[...otp]; next[idx]=d; setOtp(next); setError('')
    if(d && idx<5) inputsRef.current[idx+1]?.focus()
  }
  const handleKeyDown = (idx,e)=>{
    if(e.key==='Backspace' && !otp[idx] && idx>0) inputsRef.current[idx-1]?.focus()
  }
  const handlePaste = (e)=>{
    e.preventDefault()
    const pasted=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    if(!pasted) return
    const next=Array(6).fill(''); pasted.split('').forEach((d,i)=>next[i]=d)
    setOtp(next); inputsRef.current[Math.min(pasted.length,5)]?.focus()
  }
  const handleVerifyOtp = async()=>{
    const code=otp.join('')
    if(code.length!==6){ setError('Enter 6-digit code.'); return }
    setLoading(true); setError('')
    try{
      await verifyResetOtp({ email: email.trim(), otp: code })
      setInfo('Code verified — set your new password.')
      setError('')
      setStep(3)
    }catch(e){ setError(e.message || 'Invalid or expired code.') }finally{ setLoading(false) }
  }
  const handleReset = async()=>{
    setError(''); setSuccess('')
    if(!newPassword || !confirmPassword){ setError('Fill both password fields.'); return }
    if(newPassword.length<6){ setError('Password must be at least 6 characters.'); return }
    if(newPassword!==confirmPassword){ setError('Passwords do not match.'); return }
    const code=otp.join('')
    setLoading(true)
    try{
      await resetPassword({ email: email.trim(), otp: code, password: newPassword, passwordConfirm: confirmPassword })
      setSuccess('Password reset successfully! Redirecting to login...')
      setTimeout(()=> navigate('/login', { state:{ email: email.trim(), resetSuccess: true }, replace:true }), 1500)
    }catch(e){ setError(e.message || 'Reset failed') }finally{ setLoading(false) }
  }

  return <SplitLayout>
    <div className="flex gap-2 text-[11px] mb-4">
      {['Email','Code','New Password'].map((s,i)=><span key={s} className={`px-2 py-1 rounded-full ${step===i+1?'bg-[#4B3621] text-white':'bg-[#FAF7F2] border'}`}>{i+1}. {s}</span>)}
    </div>
    {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-3">{error}</div>}
    {success && <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2 mb-3">{success}</div>}
    {info && !error && !success && <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2 mb-3">{info}</div>}
    {step===1 && <>
      <h2 className="font-serif text-xl mb-3">Reset password</h2>
      <label className="text-xs">Email</label><input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleSendCode()} className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" placeholder="you@example.com" />
      <button onClick={handleSendCode} disabled={loading} className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Sending...' : 'Send code'}</button>
      <div className="text-xs text-center mt-3"><button onClick={()=>navigate('/login')} className="text-[#C19A6B]">Back to login</button></div>
    </>}
    {step===2 && <>
      <h2 className="font-serif text-xl mb-3">Enter code</h2>
      <p className="text-xs text-[#8A8078] mb-2">Code sent to <span className="font-medium text-[#4B3621]">{email}</span> <button onClick={()=>setStep(1)} className="text-[#C19A6B] ml-1">Change</button></p>
      <div className="flex gap-2 justify-center my-4" onPaste={handlePaste}>{Array.from({length:6}).map((_,i)=><input key={i} ref={el=>inputsRef.current[i]=el} value={otp[i]} onChange={e=>handleChangeOtp(i,e.target.value)} onKeyDown={e=>handleKeyDown(i,e)} maxLength={1} inputMode="numeric" className="w-10 h-12 border border-[#E7DFD3] rounded-lg text-center text-lg focus:ring-2 focus:ring-[#C19A6B] outline-none" />)}</div>
      <button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Verifying...' : 'Verify'}</button>
      <div className="text-xs text-center mt-3 text-[#8A8078]">Didn't receive? {cooldown>0 ? <span>Resend in {Math.floor(cooldown/60)}:{String(cooldown%60).padStart(2,'0')}</span> : <button onClick={handleResend} disabled={resending} className="text-[#C19A6B]">{resending ? 'Sending...' : 'Resend code'}</button>}</div>
    </>}
    {step===3 && <>
      <h2 className="font-serif text-xl mb-3">New password</h2>
      <div className="space-y-3"><input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="New password (min 6)" className="w-full border rounded-lg px-3 py-2 text-sm" /><input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
      <button onClick={handleReset} disabled={loading || !!success} className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Updating...' : success ? 'Success' : 'Update password'}</button>
    </>}
  </SplitLayout>
}
