import { products, orders } from '../data/mockData'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyGallery, updateGallery } from '../api/galleries'
import { getGalleryLogoUrl, getGalleryBannerUrl, STORAGE_BASE, getProductImageUrl } from '../utils/image'
import { apiFetch } from '../api/client'
import { unwrapProducts, getProduct, unwrapProduct, createProduct, updateProduct } from '../api/products'
import { getCategories, unwrapCategories } from '../api/categories'
import { createEmployee, getEmployees, getEmployee, updateEmployee, unwrapEmployees, unwrapEmployee } from '../api/employees'
import { useGallery } from '../context/GalleryContext'

export function Overview(){
  const { gallery, loading, error } = useGallery()
  const productCount = gallery?.productCount
  const employeeCount = gallery?.employeeCount
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl">Dashboard Overview</h2>
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {k:'Total Products', v: loading ? '…' : (productCount ?? '—'), c:'bg-white', sub: gallery ? `${gallery.name}` : 'From my-gallery'},
          {k:'Pending Orders', v:'7', c:'bg-amber-50', sub: 'Mock'},
          {k:'Employees', v: loading ? '…' : (employeeCount ?? '—'), c:'bg-white', sub: gallery ? 'In your gallery' : 'From my-gallery'},
          {k:'Revenue (Aug)', v:'48,200 EGP', c:'bg-green-50', sub: 'Mock'},
        ].map(s=>(
          <div key={s.k} className={`border border-[#E7DFD3] rounded-xl p-4 ${s.c}`}><div className="text-xs text-[#8A8078]">{s.k}</div><div className="text-xl font-semibold">{s.v}</div>{s.sub && <div className="text-[11px] text-[#8A8078]">{s.sub}</div>}</div>
        ))}
      </div>
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-4">
        <h3 className="font-medium mb-3">Recent Orders</h3>
        <div className="space-y-2">
          {orders.slice(0,3).map(o=>(
            <div key={o.id} className="flex justify-between text-sm border-b py-2"><span>{o.id} • {o.gallery}</span><span className="text-[#8A8078]">{o.status}</span><span>{o.total.toLocaleString()} EGP</span></div>
          ))}
        </div>
      </div>
    </div>
  )
}
export function MyGallery(){
  const navigate = useNavigate()
  const [gallery, setGallery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [form, setForm] = useState({ name:'', description:'', country:'', city:'', street:'', mapAddressUrl:'', phone:'' })
  const [initialForm, setInitialForm] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [initialLogoPreview, setInitialLogoPreview] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [initialBannerPreview, setInitialBannerPreview] = useState(null)
  const [imagesFiles, setImagesFiles] = useState([])
  const [imagesPreviews, setImagesPreviews] = useState([])
  const [initialImagesPreviews, setInitialImagesPreviews] = useState([])

  useEffect(() => {
    let cancelled = false
    async function fetchMyGallery(){
      setLoading(true)
      setFetchError('')
      try {
        const res = await getMyGallery()
        if (cancelled) return
        const g = res?.data?.data || res?.data || res
        // backend: { status: 'success', data: { gallery }} or { data: gallery }
        const gal = g?.gallery || g
        if (!gal || !gal.id && !gal._id && !gal.name) {
          // treat as no gallery — redirect to create
          navigate('/dashboard/create-gallery', { replace: true })
          return
        }
        setGallery(gal)
        const nextForm = {
          name: gal.name || '',
          description: gal.description || '',
          country: gal.country || '',
          city: gal.city || '',
          street: gal.street || '',
          mapAddressUrl: gal.mapAddressUrl || gal.mapUrl || '',
          phone: gal.phone || '',
        }
        setForm(nextForm)
        setInitialForm(nextForm)
        const logoUrl = gal.logo && gal.storageFolder ? getGalleryLogoUrl(gal) : null
        const bannerUrl = gal.banner && gal.storageFolder ? getGalleryBannerUrl(gal) : null
        if (logoUrl) { setLogoPreview(logoUrl); setInitialLogoPreview(logoUrl) }
        if (bannerUrl) { setBannerPreview(bannerUrl); setInitialBannerPreview(bannerUrl) }
        if (Array.isArray(gal.images) && gal.images.length && gal.storageFolder) {
          const previews = gal.images.map(f => f.startsWith('http') ? f : `${STORAGE_BASE}/storage/uploads/galleries/${gal.storageFolder}/${f}`)
          setImagesPreviews(previews)
          setInitialImagesPreviews(previews)
        } else {
          setInitialImagesPreviews([])
        }
      } catch (err) {
        if (cancelled) return
        // 404 means gallery_owner has no gallery yet → redirect to create
        if (err?.status === 404) {
          navigate('/dashboard/create-gallery', { replace: true })
          return
        }
        setFetchError(err.message || 'Failed to load gallery')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchMyGallery()
    return () => { cancelled = true }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(s => ({ ...s, [name]: value }))
  }
  const handleLogo = (e) => {
    const f = e.target.files?.[0]
    if (f){ setLogoFile(f); setLogoPreview(URL.createObjectURL(f)) }
  }
  const handleBanner = (e) => {
    const f = e.target.files?.[0]
    if (f){ setBannerFile(f); setBannerPreview(URL.createObjectURL(f)) }
  }
  const handleImages = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setImagesFiles(prev => [...prev, ...files].slice(0,8))
    const previews = files.map(f => URL.createObjectURL(f))
    setImagesPreviews(prev => [...prev, ...previews].slice(0,8))
  }
  const removeNewImage = (idx) => {
    // only removes newly added? For simplicity remove from both arrays.
    // If idx corresponds to existing server images, we just hide preview — backend will not delete unless we send flag. Keep simple: remove preview.
    setImagesPreviews(prev => prev.filter((_,i)=>i!==idx))
    setImagesFiles(prev => {
      // if there are more previews than files (existing images), adjust
      if (prev.length > 0 && idx >= prev.length) return prev
      return prev.filter((_,i)=>i!==idx)
    })
  }

  const hasChanges = (() => {
    if (!initialForm) return false
    if (JSON.stringify(form) !== JSON.stringify(initialForm)) return true
    if (logoFile) return true
    if (bannerFile) return true
    if (imagesFiles.length > 0) return true
    if (imagesPreviews.length !== initialImagesPreviews.length) return true
    // also check if logo/banner preview was cleared/changed via file removal (not currently supported) — handled by file
    return false
  })()

  const handleSave = async () => {
    if (!hasChanges) return
    setSaveError(''); setSaveSuccess('')
    if (!form.name.trim() || !form.description.trim()){ setSaveError('Name and description are required'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('description', form.description.trim())
      if (form.country) fd.append('country', form.country)
      if (form.city) fd.append('city', form.city.trim())
      if (form.street) fd.append('street', form.street.trim())
      if (form.mapAddressUrl) fd.append('mapAddressUrl', form.mapAddressUrl.trim())
      if (form.phone) fd.append('phone', form.phone.trim())
      if (logoFile) fd.append('logo', logoFile)
      if (bannerFile) fd.append('banner', bannerFile)
      imagesFiles.forEach(f => fd.append('images', f))
      const gid = gallery.id || gallery._id
      if (!gid) throw new Error('Missing gallery id')
      await updateGallery(gid, fd)
      setSaveSuccess('Gallery updated')
      setImagesFiles([])
      // reset dirty state to current values
      setInitialForm({ ...form })
      setInitialLogoPreview(logoPreview)
      setInitialBannerPreview(bannerPreview)
      setInitialImagesPreviews([...imagesPreviews])
      setLogoFile(null)
      setBannerFile(null)
    } catch (err){
      setSaveError(err.message || 'Failed to update')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-16 text-sm text-[#8A8078]">Loading your gallery...</div>
  if (fetchError) return <div className="text-center py-16 bg-white border rounded-xl"><p className="text-sm text-[#B3402E]">{fetchError}</p><button onClick={()=>window.location.reload()} className="mt-3 text-sm underline text-[#78582f]">Retry</button></div>
  if (!gallery) return null

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-24">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#33210d]">My Gallery</h1>
        <p className="text-sm text-[#8A8078]">Manage your gallery's brand identity, location and contact. Changes are visible to collectors immediately.</p>
      </div>

      {saveError && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-3 rounded-lg">{saveError}</div>}
      {saveSuccess && <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">{saveSuccess}</div>}

      <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
        <h2 className="font-serif text-lg font-semibold text-[#33210d] mb-6 pb-4 border-b border-[#d2c4ba]/50 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#78582f]">brush</span> Brand Identity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col items-center gap-3">
            <label className="text-sm font-medium text-[#201a17]">Gallery Logo</label>
            <label className="relative w-32 h-32 rounded-full border-2 border-dashed border-[#d2c4ba] hover:border-[#78582f] flex items-center justify-center bg-[#fdf1eb] cursor-pointer overflow-hidden group">
              <input accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" type="file" onChange={handleLogo} />
              {logoPreview ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>}
            </label>
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-medium text-[#201a17]">Cover Banner</label>
            <label className="relative w-full h-32 rounded-lg border-2 border-dashed border-[#d2c4ba] hover:border-[#78582f] flex items-center justify-center bg-[#fdf1eb] cursor-pointer overflow-hidden">
              <input accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" type="file" onChange={handleBanner} />
              {bannerPreview ? <img src={bannerPreview} alt="banner" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-3xl">panorama</span>}
            </label>
          </div>
        </div>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Gallery name*</label><input name="name" value={form.name} onChange={handleChange} className="w-full border border-[#d2c4ba] rounded-lg px-4 py-2.5 text-sm mt-1 focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20 outline-none" /></div>
          <div><label className="text-sm font-medium">Description* (500)</label><textarea name="description" value={form.description} onChange={handleChange} maxLength={500} rows={3} className="w-full border border-[#d2c4ba] rounded-lg px-4 py-2.5 text-sm mt-1 focus:border-[#78582f] focus:ring-2 focus:ring-[#78582f]/20 outline-none resize-y" /><div className="text-xs text-right text-[#8A8078]">{form.description.length}/500</div></div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
        <h2 className="font-serif text-lg font-semibold text-[#33210d] mb-6 pb-4 border-b border-[#d2c4ba]/50 flex items-center gap-2"><span className="material-symbols-outlined text-[#78582f]">location_on</span> Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="text-sm font-medium">Country</label><select name="country" value={form.country} onChange={handleChange} className="w-full border border-[#d2c4ba] rounded-lg px-4 py-2.5 text-sm mt-1 bg-white"><option value="">Select Country</option><option>Egypt</option><option>United States</option><option>United Kingdom</option><option>France</option><option>Italy</option><option>Japan</option></select></div>
          <div><label className="text-sm font-medium">City</label><input name="city" value={form.city} onChange={handleChange} className="w-full border border-[#d2c4ba] rounded-lg px-4 py-2.5 text-sm mt-1" /></div>
        </div>
        <div className="mt-4 space-y-4">
          <div><label className="text-sm font-medium">Street Address</label><input name="street" value={form.street} onChange={handleChange} className="w-full border border-[#d2c4ba] rounded-lg px-4 py-2.5 text-sm mt-1" placeholder="Optional" /></div>
          <div><label className="text-sm font-medium">Google Maps URL</label><input name="mapAddressUrl" value={form.mapAddressUrl} onChange={handleChange} className="w-full border border-[#d2c4ba] rounded-lg px-4 py-2.5 text-sm mt-1" placeholder="https://maps.google.com/..." /></div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
        <h2 className="font-serif text-lg font-semibold text-[#33210d] mb-6 pb-4 border-b border-[#d2c4ba]/50 flex items-center gap-2"><span className="material-symbols-outlined text-[#78582f]">contact_phone</span> Contact</h2>
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8078] text-[20px]">call</span>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full border border-[#d2c4ba] rounded-lg pl-10 pr-4 py-2.5 text-sm" placeholder="Phone" />
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(75,54,33,0.08)] p-6 md:p-10 border border-[#d2c4ba]/30">
        <h2 className="font-serif text-lg font-semibold text-[#33210d] mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[#78582f]">photo_library</span> Gallery Images <span className="text-xs font-normal bg-[#fdf1eb] border px-2 py-0.5 rounded-full">Optional</span></h2>
        <p className="text-sm text-[#8A8078] mb-4">Additional showcase images. Will appear on your gallery profile.</p>
        <label className="relative w-full min-h-[120px] rounded-lg border-2 border-dashed border-[#d2c4ba] hover:border-[#78582f] flex flex-col items-center justify-center bg-[#fdf1eb] cursor-pointer p-4">
          <input accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" type="file" onChange={handleImages} />
          <span className="material-symbols-outlined text-[#78582f] text-3xl">add_a_photo</span>
          <span className="text-sm font-medium">Upload images (optional)</span>
        </label>
        {imagesPreviews.length>0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {imagesPreviews.map((src,i)=>(
              <div key={i} className="relative h-28 rounded-lg overflow-hidden border">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={()=>removeNewImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[16px]">close</span></button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-end gap-3">
        <button onClick={()=>navigate('/galleries/'+ (gallery.id || gallery._id))} className="border px-6 py-2.5 rounded-lg text-sm bg-white">View public profile</button>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          title={!hasChanges ? 'No changes to save' : ''}
          className={`px-8 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition ${hasChanges && !saving ? 'bg-[#33210d] text-white hover:opacity-90' : 'bg-[#33210d]/40 text-white/80 cursor-not-allowed'}`}
        >
          {saving?'Saving...':'Save Changes'} <span className="material-symbols-outlined text-[18px]">save</span>
        </button>
      </div>
    </div>
  )
}
export function MyProducts(){
  const navigate = useNavigate()
  const [filter,setFilter]=useState('All')
  const [search,setSearch]=useState('')
  const [galleryId,setGalleryId]=useState(null)
  const [productsList,setProductsList]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [page,setPage]=useState(1)
  const [pagination,setPagination]=useState(null)

  // 1) get my gallery to obtain galleryId (same as MyGallery)
  useEffect(()=>{
    let cancelled=false
    async function fetchGallery(){
      try{
        const res=await getMyGallery()
        if(cancelled) return
        const g=res?.data?.data || res?.data || res
        const gal=g?.gallery || g
        const gid=gal?.id || gal?._id
        if(gid) setGalleryId(String(gid))
        else setError('No gallery found. Please create one first.')
      }catch(err){
        if(cancelled) return
        if(err?.status===404) setError('No gallery yet — create one to manage products.')
        else setError(err.message||'Failed to load gallery')
      }
    }
    fetchGallery()
    return()=>{cancelled=true}
  },[])

  // 2) fetch products for that galleryId — same request as GalleryProfile ( /galleries/:galleryId/products?galleryId=... )
  useEffect(()=>{
    if(!galleryId) return
    let cancelled=false
    async function fetchProducts(){
      setLoading(true)
      setError('')
      try{
        const params={ limit:20, page, sort:'-createdAt', fields:'id,name,slug,mainImageUrl,images,price,compareAtPrice,stock,status,gallery[id,name,slug],category[id,name,slug]' }
        if(search.trim()) params.keyword=search.trim()
        // same as GalleryProfile: nested route + galleryId filter
        const searchParams=new URLSearchParams()
        Object.entries(params).forEach(([k,v])=>{ if(v!==undefined&&v!==null&&v!=='') searchParams.set(k,String(v)) })
        const qs=searchParams.toString()?`?${searchParams.toString()}`:''
        const res=await apiFetch(`/galleries/${galleryId}/products${qs}${qs?'&': '?'}galleryId=${galleryId}`)
        if(cancelled) return
        const data=unwrapProducts(res)
        setProductsList(data)
        setPagination(res?.paginationResult || res?.pagination || null)
      }catch(err){
        if(cancelled) return
        setError(err.message||'Failed to load products')
        setProductsList([])
      }finally{ if(!cancelled) setLoading(false) }
    }
    fetchProducts()
    return()=>{cancelled=true}
  },[galleryId, page, search])

  const filtered = productsList.filter(p=>{
    if(filter==='All') return true
    return String(p.status).toLowerCase()===filter.toLowerCase()
  })

  if(!galleryId && loading) return <div className="text-center py-16 text-sm text-[#8A8078]">Loading your gallery...</div>
  if(error && !galleryId) return <div className="text-center py-16 bg-white border rounded-xl"><p className="text-sm text-[#8A8078]">{error}</p><button onClick={()=>navigate('/dashboard/create-gallery')} className="mt-3 bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm">Create Gallery</button></div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-xl">My Products</h2>
        <button onClick={()=>navigate('/dashboard/add-product')} className="bg-[#4B3621] text-white px-4 py-1.5 rounded-full text-sm">+ Add Product</button>
      </div>
      <div className="flex gap-2">
        {['All','Active','Draft','Archived'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1 rounded-full text-xs border ${filter===f?'bg-[#4B3621] text-white':'bg-white'}`}>{f}</button>
        ))}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name" className="ml-auto border rounded-full px-3 py-1 text-xs" />
      </div>
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      {loading ? <div className="text-center py-12 text-sm text-[#8A8078]">Loading products...</div> : filtered.length===0 ? <div className="text-center py-12 bg-white border border-dashed rounded-xl text-sm text-[#8A8078]">No products found {search?`for "${search}"`:''} — <button onClick={()=>navigate('/dashboard/add-product')} className="text-[#C19A6B] underline">Add first product</button></div> : (
      <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]"><tr><th className="text-left p-3">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p=>{
                const displayImg = getProductImageUrl(p) || p.image || 'https://via.placeholder.com/40'
                const cat = p.category?.name || (typeof p.category==='string'?p.category:'')
                return (
                <tr key={p.id||p._id} className="border-t">
                  <td className="p-3 flex items-center gap-2"><img src={displayImg} alt={p.name} className="w-10 h-10 rounded object-cover" onError={e=>e.target.style.display='none'} />{p.name}</td>
                  <td className="text-center text-xs">{cat || '—'}</td>
                  <td className="text-center">{Number(p.price).toLocaleString()} EGP</td>
                  <td className={`text-center ${Number(p.stock)<=3?'text-amber-600':''}`}>{p.stock ?? '—'}</td>
                  <td className="text-center"><span className={`px-2 py-0.5 rounded-full text-[11px] ${String(p.status).toLowerCase()==='active'?'bg-green-100 text-green-800': String(p.status).toLowerCase()==='draft'?'bg-amber-100 text-amber-800':'bg-zinc-100'}`}>{p.status || '—'}</span></td>
                  <td className="text-center"><button onClick={()=>navigate(`/dashboard/add-product?id=${p.id||p._id}`)} className="text-xs border px-2 py-1 rounded mr-1">Edit</button><button className="text-xs text-[#B3402E]">Delete</button></td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        {pagination && (
          <div className="flex justify-center items-center gap-2 p-3 border-t">
            <button disabled={!pagination.prev && page===1} onClick={()=>setPage(x=>Math.max(1,x-1))} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40">Prev</button>
            <span className="text-sm text-[#8A8078]">Page {pagination.currentPage || page} / {pagination.numberOfPages || 1}</span>
            <button disabled={!pagination.next && pagination?.numberOfPages && page>=pagination.numberOfPages} onClick={()=>setPage(x=>x+1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
      )}
    </div>
  )
}
export function AddEditProduct(){
  const navigate = useNavigate()
  const { galleryId: ctxGalleryId } = useGallery()
  const [searchParams] = useState(()=> new URLSearchParams(window.location.search))
  const editId = searchParams.get('id') || new URLSearchParams(window.location.search).get('id')
  const isEdit = !!editId
  const [categories, setCategories]=useState([])
  const [catLoading,setCatLoading]=useState(true)
  const [loadingProduct,setLoadingProduct]=useState(isEdit)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')
  const [success,setSuccess]=useState('')
  const [form,setForm]=useState({
    name:'', categoryId:'', price:'', compareAtPrice:'', stock:'5', status:'active', dimensions:'', description:''
  })
  const [materials,setMaterials]=useState([])
  const [materialInput,setMaterialInput]=useState('')
  const [mainFile,setMainFile]=useState(null)
  const [mainPreview,setMainPreview]=useState(null)
  const [imagesFiles,setImagesFiles]=useState([])
  const [imagesPreviews,setImagesPreviews]=useState([])

  useEffect(()=>{
    let cancelled=false
    async function loadCats(){
      setCatLoading(true)
      try{
        const res=await getCategories({limit:50, fields:'id,name,arabicName,slug', sort:'name'})
        if(cancelled) return
        const data=unwrapCategories(res)
        setCategories(data)
        if(data.length && !form.categoryId) setForm(s=>({...s, categoryId: data[0].id||data[0]._id}))
      }catch{}
      finally{ if(!cancelled) setCatLoading(false)}
    }
    loadCats()
    return()=>{cancelled=true}
  },[])

  useEffect(()=>{
    if(!isEdit) return
    let cancelled=false
    async function loadProduct(){
      setLoadingProduct(true)
      try{
        const res=await getProduct(editId)
        if(cancelled) return
        const p=unwrapProduct(res)
        if(!p) throw new Error('Product not found')
        setForm({
          name: p.name||'',
          categoryId: p.category?.id || p.categoryId || p.category || '',
          price: String(p.price ?? ''),
          compareAtPrice: String(p.compareAtPrice ?? ''),
          stock: String(p.stock ?? '5'),
          status: p.status || 'active',
          dimensions: typeof p.dimensions==='string'?p.dimensions : p.dimensions ? `${p.dimensions.width||''}` : '',
          description: p.description||'',
        })
        let mats=[]
        try{ mats= Array.isArray(p.materials)?p.materials: JSON.parse(p.materials||'[]') }catch{ mats= p.materials||[] }
        setMaterials(mats)
        if(p.mainImageUrl){
          const url=getProductImageUrl(p)
          if(url) setMainPreview(url)
        }
        if(Array.isArray(p.images)&&p.images.length){
          const urls=p.images.map(img=> getProductImageUrl({mainImageUrl:img, storageFolder:p.storageFolder}) || img)
          setImagesPreviews(urls.slice(0,6))
        }
      }catch(err){ if(!cancelled) setError(err.message||'Failed to load product') }
      finally{ if(!cancelled) setLoadingProduct(false)}
    }
    loadProduct()
    return()=>{cancelled=true}
  },[editId, isEdit])

  const handleChange=(e)=>{
    const {name,value}=e.target
    setForm(s=>({...s, [name]: value}))
  }
  const handleMain=(e)=>{
    const f=e.target.files?.[0]
    if(f){ setMainFile(f); setMainPreview(URL.createObjectURL(f)) }
  }
  const handleImages=(e)=>{
    const files=Array.from(e.target.files||[])
    if(!files.length) return
    setImagesFiles(prev=>[...prev, ...files].slice(0,8))
    const previews=files.map(f=>URL.createObjectURL(f))
    setImagesPreviews(prev=>[...prev, ...previews].slice(0,8))
  }
  const removeImage=(idx)=>{
    setImagesPreviews(p=>p.filter((_,i)=>i!==idx))
    setImagesFiles(prev=>{
      // if removing an existing server image (not in files), keep files as is but has visual removal
      // for simplicity remove from files if idx within files length offset
      const existingCount = imagesPreviews.length - imagesFiles.length
      if(idx < existingCount) return prev
      return prev.filter((_,i)=> i !== (idx - existingCount))
    })
  }
  const addMaterial=(e)=>{
    if(e.key==='Enter'){
      e.preventDefault()
      const v=materialInput.trim()
      if(v && !materials.includes(v)){ setMaterials(m=>[...m, v]); setMaterialInput('') }
    }
  }
  const removeMaterial=(idx)=> setMaterials(m=>m.filter((_,i)=>i!==idx))

  const slugPreview = form.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-*$)/g,'') || 'new-product'

  const handleSubmit=async(e)=>{
    e?.preventDefault()
    setError(''); setSuccess('')
    if(!form.name.trim()){ setError('Name is required'); return }
    if(!form.categoryId){ setError('Category is required'); return }
    if(!form.price || isNaN(Number(form.price))){ setError('Valid price is required'); return }
    setSaving(true)
    try{
      const fd=new FormData()
      // only schema fields: categoryId (not category), name, price, compareAtPrice, stock, status, dimensions, description, materials, mainImageUrl, images
      // galleryId/createdById/slug/isFeatured removed per request - isFeatured defaults false
      fd.append('name', form.name.trim())
      fd.append('categoryId', form.categoryId)
      fd.append('price', String(Number(form.price)))
      if(form.compareAtPrice) fd.append('compareAtPrice', String(Number(form.compareAtPrice)))
      fd.append('stock', String(Number(form.stock||0)))
      fd.append('status', form.status)
      if(form.dimensions) fd.append('dimensions', form.dimensions)
      if(form.description) fd.append('description', form.description)
      if(materials.length) materials.forEach(m => fd.append('materials', m))
      if(mainFile) fd.append('mainImageUrl', mainFile)
      imagesFiles.forEach(f=> fd.append('images', f))
      // also append galleryId auto-resolved; backend assigns from owner, no need to send
      if(isEdit) await updateProduct(editId, fd, ctxGalleryId || null)
      else await createProduct(fd, ctxGalleryId || null)
      setSuccess(isEdit?'Product updated':'Product created')
      setTimeout(()=> navigate('/dashboard/my-products'), 800)
    }catch(err){
      setError(err.message||'Failed to save product')
      if(err.details) setError(typeof err.details==='string'?err.details: JSON.stringify(err.details))
    }finally{ setSaving(false)}
  }

  if(isEdit && loadingProduct) return <div className="text-center py-16 text-sm text-[#8A8078]">Loading product...</div>

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center gap-2 text-xs text-[#8A8078]"><button onClick={()=>navigate('/dashboard/my-products')} className="hover:text-[#4B3621]">Dashboard</button><span className="material-symbols-outlined text-[14px]">chevron_right</span><span className="text-[#4B3621] font-medium">{isEdit?'Edit Product':'Add New Product'}</span></div>
      <h2 className="font-serif text-2xl">{isEdit?'Edit Product':'Add New Product'}</h2>
      <p className="text-sm text-[#8A8078]">Curate your gallery inventory with detailed specifications and high-quality imagery.</p>
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">{success}</div>}
      <form onSubmit={handleSubmit} className="grid md:grid-cols-[1fr_340px] gap-6">
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
          <div><label className="text-xs font-medium">Name* (slug: /products/{slugPreview})</label><input name="name" value={form.name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:border-[#78582f] focus:ring-1 focus:ring-[#78582f]/20 outline-none" placeholder="Oak Dining Table" /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">Category*</label>{catLoading? <div className="text-xs text-[#8A8078] mt-1">Loading...</div> : <select name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-white"><option value="">Select category</option>{categories.map(c=> <option key={c.id||c._id} value={c.id||c._id}>{c.name} {c.arabicName?`· ${c.arabicName}`:''}</option>)}</select>}</div><div><label className="text-xs">Price*</label><input name="price" value={form.price} onChange={handleChange} type="number" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="12500" /></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">Compare-at price</label><input name="compareAtPrice" value={form.compareAtPrice} onChange={handleChange} type="number" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="13900" /></div><div><label className="text-xs">Stock</label><input name="stock" value={form.stock} onChange={handleChange} type="number" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
          <div><label className="text-xs">Status</label><div className="flex gap-2 text-xs mt-1">{['draft','active','archived'].map(s=> <button key={s} type="button" onClick={()=>setForm(f=>({...f, status:s}))} className={`px-3 py-1 rounded-full border capitalize ${form.status===s?'bg-[#4B3621] text-white border-[#4B3621]':'bg-white'}`}>{s}</button>)}</div></div>
          <div><label className="text-xs">Dimensions</label><input name="dimensions" value={form.dimensions} onChange={handleChange} placeholder="W 200 × D 90 × H 75 cm" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <div><label className="text-xs">Materials (type + Enter)</label><div className="flex flex-wrap gap-2 mt-1 items-center">{materials.map((m,i)=><span key={i} className="border px-2 py-1 rounded-full text-xs flex items-center gap-1">{m} <button type="button" onClick={()=>removeMaterial(i)} className="text-[#B3402E]">✕</button></span>)}<input value={materialInput} onChange={e=>setMaterialInput(e.target.value)} onKeyDown={addMaterial} className="flex-1 min-w-[120px] border rounded-full px-3 py-1 text-xs" placeholder="Add material" /></div></div>
          <div><label className="text-xs">Description (1000)</label><textarea name="description" value={form.description} onChange={handleChange} maxLength={1000} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Describe the piece..." /><div className="text-xs text-right text-[#8A8078]">{form.description.length}/1000</div></div>
          <div className="flex gap-3"><button type="button" onClick={()=>navigate('/dashboard/my-products')} className="border px-4 py-2 rounded-lg text-sm">Cancel</button><button type="submit" disabled={saving} className="bg-[#4B3621] text-white px-6 py-2 rounded-lg text-sm disabled:opacity-60">{saving?(isEdit?'Updating...':'Creating...'):(isEdit?'Update Product':'Save Product')}</button></div>
        </div>
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-4 space-y-3 h-fit">
          <h3 className="text-sm font-medium flex justify-between">Media <span className="text-xs text-[#8A8078]">Primary</span></h3>
          <label className="border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center text-xs text-[#8A8078] cursor-pointer hover:border-[#C19A6B] hover:bg-[#FAF7F2] transition overflow-hidden relative">
            <input accept="image/*" type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleMain} />
            {mainPreview ? <img src={mainPreview} alt="main" className="w-full h-full object-cover rounded-xl" /> : <><span className="material-symbols-outlined">add_photo_alternate</span> Main image dropzone — drag & drop</>}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="h-20 border-2 border-dashed rounded-lg flex items-center justify-center text-[10px] cursor-pointer hover:border-[#C19A6B]"><input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />+</label>
            {imagesPreviews.map((src,i)=><div key={i} className="h-20 rounded-lg overflow-hidden relative group border"><img src={src} alt="" className="w-full h-full object-cover" /><button type="button" onClick={()=>removeImage(i)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs">Remove</button></div>)}
          </div>
          <p className="text-[11px] text-[#8A8078]">Primary image will be used as mainImageUrl. Additional images up to 8.</p>
        </div>
      </form>
    </div>
  )
}
export function GalleryOrders(){
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">Gallery Orders</h2>
      <div className="flex gap-2"><input placeholder="Search order / customer" className="border rounded-full px-3 py-1.5 text-sm flex-1" /><select className="border rounded-full px-3 py-1.5 text-sm bg-white"><option>All Status</option><option>pending</option><option>accepted</option></select></div>
      <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]"><tr><th className="p-3 text-left">Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {orders.map(o=>(
              <tr key={o.id} className="border-t"><td className="p-3 font-mono text-xs">{o.id}<div className="text-[11px] text-[#8A8078]">{o.date}</div></td><td className="text-xs">{o.customer}<div className="text-[11px] text-[#8A8078]">{o.gallery}</div></td><td className="text-center">{o.items}</td><td className="text-center">{o.total.toLocaleString()} EGP</td><td><span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-100">{o.status}</span></td><td><button onClick={()=>navigate(`/dashboard/orders/${o.id}`)} className="text-xs border px-2 py-1 rounded">View</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export function OrderDetails(){
  const o = orders[0]
  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="font-serif text-2xl">Order {o.id}</h2>
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
        <div className="flex justify-between"><span className="text-sm">{o.date} • {o.gallery}</span><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs">{o.status}</span></div>
        <div className="space-y-2">
          {[{name:'Oak Dining Table', price:1250, qty:2, img:products[5].image},{name:'Walnut Bench', price:480, qty:1, img:products[3].image}].map(it=>(
            <div key={it.name} className="flex gap-3 border-t py-3"><img src={it.img} className="w-16 h-16 rounded object-cover" alt="" /><div className="flex-1"><div className="text-sm font-medium">{it.name}</div><div className="text-xs text-[#8A8078]">{it.price.toLocaleString()} EGP × {it.qty}</div></div><div className="text-sm">{(it.price*it.qty).toLocaleString()} EGP</div></div>
          ))}
        </div>
        <div className="bg-[#FAF7F2] rounded-lg p-3 text-xs"><div className="font-medium">Shipping address</div><div className="text-[#8A8078]">12 El Hegaz St, Cairo, Egypt — Apt 4</div><div className="font-medium mt-2">Note</div><div className="text-[#8A8078]">Please deliver after 5pm</div></div>
        <div className="flex justify-between font-semibold"><span>Grand total</span><span>{o.total.toLocaleString()} EGP</span></div>
      </div>
    </div>
  )
}
export function Employees(){
  const navigate = useNavigate()
  const { galleryId: ctxGalleryId } = useGallery()
  const [search, setSearch] = useState('')
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!ctxGalleryId) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function fetchEmployees(){
      setLoading(true)
      setError('')
      try {
        const res = await getEmployees({ galleryId: ctxGalleryId })
        if (cancelled) return
        const data = unwrapEmployees(res)
        setEmployees(data)
      } catch (err) {
        if (cancelled) return
        setError(err.message || 'Failed to load employees')
        setEmployees([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchEmployees()
    return () => { cancelled = true }
  }, [ctxGalleryId])

  const filtered = employees.filter(e => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const name = `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase() || (e.name||'').toLowerCase()
    const email = (e.email || e.user?.email || '').toLowerCase()
    const title = (e.title || e.jobTitle || '').toLowerCase()
    return name.includes(q) || email.includes(q) || title.includes(q)
  })

  if (!ctxGalleryId && !loading) return <div className="text-center py-16 bg-white border rounded-xl"><p className="text-sm text-[#8A8078]">No gallery found. Please create a gallery first.</p><button onClick={()=>navigate('/dashboard/create-gallery')} className="mt-3 bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm">Create Gallery</button></div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="font-serif text-xl">Employees</h2><button onClick={()=>navigate('/dashboard/employees/add')} className="bg-[#4B3621] text-white px-4 py-1.5 rounded-full text-sm">+ Add Employee</button></div>
      {ctxGalleryId && <p className="text-xs text-[#8A8078]">Gallery: <span className="font-mono">{ctxGalleryId}</span> • GET <span className="font-mono">/galleries/{ctxGalleryId}/employees</span></p>}
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name/email" className="w-full border rounded-full px-4 py-2 text-sm" />
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      {loading ? <div className="text-center py-12 text-sm text-[#8A8078]">Loading employees...</div> : filtered.length===0 ? <div className="text-center py-12 bg-white border border-dashed rounded-xl text-sm text-[#8A8078]">No employees found {search?`for "${search}"`:''} — <button onClick={()=>navigate('/dashboard/employees/add')} className="text-[#C19A6B] underline">Add first employee</button></div> : (
      <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]"><tr><th className="p-3 text-left">Employee</th><th>Job title</th><th>Email</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(e=>{
              const name = e.name || `${e.firstName||''} ${e.lastName||''}`.trim() || e.user?.firstName ? `${e.user.firstName} ${e.user.lastName||''}`.trim() : 'Employee'
              const email = e.email || e.user?.email || ''
              const title = e.title || e.jobTitle || ''
              const active = e.isActive ?? e.active ?? true
              const date = e.createdAt ? new Date(e.createdAt).toLocaleDateString() : e.date || ''
              const initials = name.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase()
              return (
              <tr key={e.id || email} className="border-t"><td className="p-3 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#FAF7F2] border flex items-center justify-center text-xs">{initials}</div>{name}</td><td className="text-center text-xs">{title || '—'}</td><td className="text-xs">{email}</td><td className="text-center"><span className={`px-2 py-0.5 rounded-full text-[11px] ${active?'bg-green-100 text-green-800':'bg-zinc-100'}`}>{active?'Active':'Inactive'}</span></td><td className="text-xs">{date}</td><td className="text-center"><button onClick={()=>navigate(`/dashboard/employees/add?id=${e.id}`)} className="text-xs border px-2 py-1 rounded hover:bg-[#FAF7F2]">Edit</button></td></tr>
            )})}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
export function AddEmployee(){
  const navigate=useNavigate()
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
        if(!emp) throw new Error('Employee not found')
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
        if(!cancelled) setError(err.message || 'Failed to load employee')
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
    if(!form.firstName.trim() || form.firstName.trim().length<2){ setError('First name min 2 chars'); return}
    if(!form.lastName.trim() || form.lastName.trim().length<2){ setError('Last name min 2 chars'); return}
    if(!form.email.trim()){ setError('Email is required'); return}
    if(!isEdit){
      if(!form.password || form.password.length<6){ setError('Password min 6'); return}
      if(form.password !== form.passwordConfirm){ setError('Passwords do not match'); return}
    } else {
      if(form.password && form.password.length<6){ setError('Password min 6'); return}
      if(form.password && form.password !== form.passwordConfirm){ setError('Passwords do not match'); return}
    }
    if (!ctxGalleryId && !ctxGallery) {
      setError('No gallery found. Please create a gallery first.')
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
        setSuccess('Employee updated')
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
        setSuccess('Employee created')
      }
      setTimeout(()=> navigate('/dashboard/employees'), 800)
    }catch(err){
      const msg=err.message || (isEdit ? 'Failed to update employee' : 'Failed to create employee')
      setError(msg)
      if(err.details) setError(typeof err.details==='string'?err.details: JSON.stringify(err.details))
    }finally{ setSaving(false)}
  }
  if (isEdit && loadingEdit) return <div className="text-center py-16 text-sm text-[#8A8078]">Loading employee...</div>
  return (
    <div className="max-w-xl mx-auto bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
      <h2 className="font-serif text-xl">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
      <p className="text-xs text-[#8A8078] bg-amber-50 border border-amber-200 rounded p-2">{isEdit ? 'Update employee details. Leave password blank to keep current.' : 'This employee will automatically belong to your gallery.'} {ctxGalleryId && <span className="font-mono">/galleries/{ctxGalleryId}/employees{isEdit ? `/${editId}` : ''}</span>}</p>
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-2 rounded-lg">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">First name*</label><input name="firstName" value={form.firstName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div><div><label className="text-xs">Last name*</label><input name="lastName" value={form.lastName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
        <div><label className="text-xs">Email* (unique)</label><input name="email" value={form.email} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="employee@gallery.test" type="email" /></div>
        <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">{isEdit ? 'New password (leave blank to keep)' : 'Temporary password* (min 6)'}</label><input name="password" value={form.password} onChange={handleChange} type="password" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div><div><label className="text-xs">{isEdit ? 'Confirm new' : 'Confirm*'}</label><input name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange} type="password" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
        <div><label className="text-xs">Title</label><input name="title" value={form.title} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Sales, Inventory..." /></div>
        <div><label className="text-xs">Phone</label><input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
        <div className="flex gap-3"><button type="button" onClick={()=>navigate('/dashboard/employees')} className="flex-1 border py-2 rounded-lg text-sm">Cancel</button><button type="submit" disabled={saving} className="flex-1 bg-[#4B3621] text-white py-2 rounded-lg text-sm disabled:opacity-60">{saving?(isEdit?'Updating...':'Creating...'):(isEdit?'Update Employee':'Create Employee')}</button></div>
      </form>
    </div>
  )
}
export { default as CreateGallery } from './CreateGallery'
