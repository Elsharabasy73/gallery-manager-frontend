import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signup as signupApi } from '../api/auth'

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
  return <SplitLayout>
    <h2 className="font-serif text-2xl mb-1">Welcome back</h2><p className="text-xs text-[#8A8078] mb-6">Log in to continue</p>
    <div className="space-y-3">
      <div><label className="text-xs font-medium">Email</label><input className="w-full border border-[#E7DFD3] rounded-lg px-3 py-2 mt-1 text-sm" placeholder="you@example.com" /></div>
      <div><label className="text-xs font-medium">Password</label><div className="relative"><input type="password" className="w-full border border-[#E7DFD3] rounded-lg px-3 py-2 mt-1 text-sm pr-10" placeholder="••••••••" /><span className="material-symbols-outlined absolute right-2 top-3 text-[18px] text-[#8A8078]">visibility</span></div></div>
      <button className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm font-medium mt-2">Log in</button>
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
      // backend returns 201 {status, data: user} and sets isActive=true (no OTP required)
      // redirect to login with email prefilled
      navigate('/login', { state: { email: res.data?.email || email, justSignedUp: true } })
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
  return <SplitLayout>
    <h2 className="font-serif text-xl mb-1">Verify your email</h2><p className="text-xs text-[#8A8078] mb-4">We sent a code to alex@atelier.test <button className="text-[#C19A6B]">Change</button></p>
    <div className="flex gap-2 justify-center my-6">
      {Array.from({length:6}).map((_,i)=><input key={i} maxLength={1} className="w-10 h-12 border border-[#E7DFD3] rounded-lg text-center text-lg font-medium focus:ring-2 focus:ring-[#C19A6B] outline-none" />)}
    </div>
    <button onClick={()=>navigate('/')} className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm">Verify</button>
    <div className="text-xs text-center mt-3 text-[#8A8078]">Didn't receive? <button className="text-[#C19A6B]">Resend in 29s</button></div>
  </SplitLayout>
}
export function ForgotPassword(){
  const navigate = useNavigate()
  const [step,setStep]=useState(1)
  return <SplitLayout>
    <div className="flex gap-2 text-[11px] mb-4">
      {['Email','Code','New Password'].map((s,i)=><span key={s} className={`px-2 py-1 rounded-full ${step===i+1?'bg-[#4B3621] text-white':'bg-[#FAF7F2] border'}`}>{i+1}. {s}</span>)}
    </div>
    {step===1 && <>
      <h2 className="font-serif text-xl mb-3">Reset password</h2>
      <label className="text-xs">Email</label><input className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" placeholder="you@example.com" />
      <button onClick={()=>setStep(2)} className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm mt-4">Send code</button>
    </>}
    {step===2 && <>
      <h2 className="font-serif text-xl mb-3">Enter code</h2>
      <div className="flex gap-2 justify-center my-4">{Array.from({length:6}).map((_,i)=><input key={i} className="w-10 h-12 border rounded-lg text-center" />)}</div>
      <button onClick={()=>setStep(3)} className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm">Verify</button>
    </>}
    {step===3 && <>
      <h2 className="font-serif text-xl mb-3">New password</h2>
      <div className="space-y-3"><input type="password" placeholder="New password" className="w-full border rounded-lg px-3 py-2 text-sm" /><input type="password" placeholder="Confirm" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
      <button onClick={()=>navigate('/login')} className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm mt-4">Update password</button>
    </>}
  </SplitLayout>
}
