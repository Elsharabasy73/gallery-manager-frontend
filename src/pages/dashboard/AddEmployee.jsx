import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmployee, getEmployee, updateEmployee, unwrapEmployee } from '../../api/employees';
import { useGallery } from '../../context/GalleryContext';
import { useLanguage } from '../../i18n/LanguageContext';

export function AddEmployee(){
  const navigate=useNavigate()
  const { t } = useLanguage()
  const editId = new URLSearchParams(window.location.search).get('id')
  const isEdit = !!editId
  const [form,setForm]=useState({firstName:'', lastName:'', email:'', password:'', passwordConfirm:'', title:'', phone:''})
  const [saving,setSaving]=useState(false)
  const [loadingEdit,setLoadingEdit]=useState(isEdit)
  const [error,setError]=useState('')
  const [success,setSuccess]=useState('')
  const { gallery: ctxGallery, galleryId: ctxGalleryId } = useGallery()

  useEffect(()=>{
    if(!isEdit) return
    let cancelled=false
    async function fetchEmployee(){
      setLoadingEdit(true)
      setError('')
      try{
        const res = await getEmployee(editId, { galleryId: ctxGalleryId || undefined })
        if(cancelled) return
        const emp = unwrapEmployee(res)
        if(!emp) throw new Error(t('addEmployee.notFound'))
        const user = emp.user || {}
        setForm({
          firstName: emp.firstName || user.firstName || '',
          lastName: emp.lastName || user.lastName || '',
          email: emp.email || user.email || '',
          password: '',
          passwordConfirm: '',
          title: emp.title || '',
          phone: emp.phone || user.phone || '',
        })
      }catch(err){
        if(!cancelled) setError(err.message || t('addEmployee.loadFail'))
      }finally{ if(!cancelled) setLoadingEdit(false)}
    }
    fetchEmployee()
    return ()=>{cancelled=true}
  },[isEdit, editId, ctxGalleryId])

  const handleChange=(e)=>{
    const {name,value}=e.target
    const key=name==='first_name'?'firstName': name==='last_name'?'lastName': name==='title'?'title': name
    setForm(s=>({...s, [key]:value}))
  }
  const handleSubmit=async(e)=>{
    e.preventDefault()
    setError(''); setSuccess('')
    if(!form.firstName.trim() || form.firstName.trim().length<2){ setError(t('addEmployee.firstMin')); return}
    if(!form.lastName.trim() || form.lastName.trim().length<2){ setError(t('addEmployee.lastMin')); return}
    if(!form.email.trim()){ setError(t('addEmployee.emailRequired')); return}
    if(!isEdit){
      if(!form.password || form.password.length<6){ setError(t('addEmployee.passMin')); return}
      if(form.password !== form.passwordConfirm){ setError(t('addEmployee.passMismatch')); return}
    } else {
      if(form.password && form.password.length<6){ setError(t('addEmployee.passMin')); return}
      if(form.password && form.password !== form.passwordConfirm){ setError(t('addEmployee.passMismatch')); return}
    }
    if (!ctxGalleryId && !ctxGallery) {
      setError(t('addEmployee.noGallery'))
      return
    }
    setSaving(true)
    try{
      if(isEdit){
        await updateEmployee(editId, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          ...(form.password ? { password: form.password, passwordConfirm: form.passwordConfirm } : {}),
          title: form.title?.trim() || undefined,
          phone: form.phone?.trim() || undefined,
        }, ctxGalleryId || ctxGallery?.id || ctxGallery?._id || null)
        setSuccess(t('addEmployee.updated'))
      } else {
        await createEmployee({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          passwordConfirm: form.passwordConfirm,
          title: form.title?.trim() || undefined,
          phone: form.phone?.trim() || undefined,
        }, ctxGalleryId || ctxGallery?.id || ctxGallery?._id || null)
        setSuccess(t('addEmployee.created'))
      }
      setTimeout(()=> navigate('/dashboard/employees'), 800)
    }catch(err){
      const msg=err.message || (isEdit ? t('addEmployee.updateFail') : t('addEmployee.createFail'))
      setError(msg)
      if(err.details) setError(typeof err.details==='string'?err.details: JSON.stringify(err.details))
    }finally{ setSaving(false)}
  }
  if (isEdit && loadingEdit) return <div className="text-center py-16 text-sm text-[#8A8078]">{t('addEmployee.loading')}</div>
  return (
    <div className="max-w-xl mx-auto bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
      <h2 className="font-serif text-xl">{isEdit ? t('addEmployee.editTitle') : t('addEmployee.addTitle')}</h2>
      <p className="text-xs text-[#8A8078] bg-amber-50 border border-amber-200 rounded p-2">{isEdit ? t('addEmployee.editHint') : t('addEmployee.addHint')} {ctxGalleryId && <span className="font-mono">/galleries/{ctxGalleryId}/employees{isEdit ? `/${editId}` : ''}</span>}</p>
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-2 rounded-lg">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">{t('addEmployee.firstName')}</label><input name="firstName" value={form.firstName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div><div><label className="text-xs">{t('addEmployee.lastName')}</label><input name="lastName" value={form.lastName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
        <div><label className="text-xs">{t('addEmployee.email')}</label><input name="email" value={form.email} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="employee@gallery.test" type="email" /></div>
        <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">{isEdit ? t('addEmployee.newPass') : t('addEmployee.pass')}</label><input name="password" value={form.password} onChange={handleChange} type="password" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div><div><label className="text-xs">{isEdit ? t('addEmployee.confirmNew') : t('addEmployee.confirm')}</label><input name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange} type="password" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
        <div><label className="text-xs">{t('addEmployee.title')}</label><input name="title" value={form.title} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder={t('addEmployee.titlePh')} /></div>
        <div><label className="text-xs">{t('addEmployee.phone')}</label><input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
        <div className="flex gap-3"><button type="button" onClick={()=>navigate('/dashboard/employees')} className="flex-1 border py-2 rounded-lg text-sm">{t('common.cancel')}</button><button type="submit" disabled={saving} className="flex-1 bg-[#4B3621] text-white py-2 rounded-lg text-sm disabled:opacity-60">{saving?(isEdit?t('addEmployee.updating'):t('addEmployee.creating')):(isEdit?t('addEmployee.update'):t('addEmployee.create'))}</button></div>
      </form>
    </div>
  )
}

export default AddEmployee;
