import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductImageUrl } from '../../utils/image';
import { getProduct, unwrapProduct, createProduct, updateProduct } from '../../api/products';
import { getCategories, unwrapCategories } from '../../api/categories';
import { useGallery } from '../../context/GalleryContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { compressImage, prepareImages, IMAGE_PRESETS } from '../../utils/compressImage';

export function AddEditProduct(){
  const navigate = useNavigate()
  const { t, formatNumber, categoryLabel } = useLanguage()
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
  const [photoError,setPhotoError]=useState('')
  const [optimizing,setOptimizing]=useState(false)

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
  const handleMain=async(e)=>{
    const f=e.target.files?.[0]
    e.target.value=''
    if(!f) return
    setPhotoError('')
    setOptimizing(true)
    try{
      const { file }=await compressImage(f, IMAGE_PRESETS.product)
      if(mainPreview?.startsWith('blob:')) URL.revokeObjectURL(mainPreview)
      setMainFile(file); setMainPreview(URL.createObjectURL(file))
    }catch(err){ setPhotoError(err.message||'Could not process image.') }
    finally{ setOptimizing(false) }
  }
  const handleImages=async(e)=>{
    const files=Array.from(e.target.files||[])
    e.target.value=''
    if(!files.length) return
    setPhotoError('')
    setOptimizing(true)
    try{
      const { files: ready, skipped }=await prepareImages(files, IMAGE_PRESETS.product)
      if(skipped.length) setPhotoError(`${skipped.length} image(s) skipped — over 12MB each: ${skipped.join(', ')}`)
      if(!ready.length) return
      setImagesFiles(prev=>[...prev, ...ready].slice(0,8))
      const previews=ready.map(f=>URL.createObjectURL(f))
      setImagesPreviews(prev=>[...prev, ...previews].slice(0,8))
    }finally{ setOptimizing(false) }
  }
  const removeImage=(idx)=>{
    const src=imagesPreviews[idx]
    if(src?.startsWith('blob:')) URL.revokeObjectURL(src)
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
    if(!form.name.trim()){ setError(t('addProduct.nameRequired')); return }
    if(!form.categoryId){ setError(t('addProduct.categoryRequired')); return }
    if(!form.price || isNaN(Number(form.price))){ setError(t('addProduct.priceRequired')); return }
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
      setSuccess(isEdit?t('addProduct.updated'):t('addProduct.created'))
      setTimeout(()=> navigate('/dashboard/my-products'), 800)
    }catch(err){
      setError(err.message||t('addProduct.saveFail'))
      if(err.details) setError(typeof err.details==='string'?err.details: JSON.stringify(err.details))
    }finally{ setSaving(false)}
  }

  if(isEdit && loadingProduct) return <div className="text-center py-16 text-sm text-[#8A8078]">{t('addProduct.loading')}</div>

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center gap-2 text-xs text-[#8A8078]"><button onClick={()=>navigate('/dashboard/my-products')} className="hover:text-[#4B3621]">{t('addProduct.breadcrumb')}</button><span className="material-symbols-outlined text-[14px] rtl:rotate-180">chevron_right</span><span className="text-[#4B3621] font-medium">{isEdit?t('addProduct.editTitle'):t('addProduct.addTitle')}</span></div>
      <h2 className="font-serif text-2xl">{isEdit?t('addProduct.editTitle'):t('addProduct.addTitle')}</h2>
      <p className="text-sm text-[#8A8078]">{t('addProduct.sub')}</p>
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">{success}</div>}
      <form onSubmit={handleSubmit} className="grid md:grid-cols-[1fr_340px] gap-6">
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
          <div><label className="text-xs font-medium">{t('addProduct.name', { slug: slugPreview })}</label><input name="name" value={form.name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:border-[#78582f] focus:ring-1 focus:ring-[#78582f]/20 outline-none" placeholder={t('addProduct.namePh')} /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">{t('addProduct.category')}</label>{catLoading? <div className="text-xs text-[#8A8078] mt-1">{t('addProduct.loadingCats')}</div> : <select name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-white"><option value="">{t('addProduct.selectCategory')}</option>{categories.map(c=> <option key={c.id||c._id} value={c.id||c._id}>{categoryLabel(c)}</option>)}</select>}</div><div><label className="text-xs">{t('addProduct.price')}</label><input name="price" value={form.price} onChange={handleChange} type="number" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="12500" /></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs">{t('addProduct.compare')}</label><input name="compareAtPrice" value={form.compareAtPrice} onChange={handleChange} type="number" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="13900" /></div><div><label className="text-xs">{t('addProduct.stock')}</label><input name="stock" value={form.stock} onChange={handleChange} type="number" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div></div>
          <div><label className="text-xs">{t('addProduct.status')}</label><div className="flex gap-2 text-xs mt-1">{['draft','active','archived'].map(s=> <button key={s} type="button" onClick={()=>setForm(f=>({...f, status:s}))} className={`px-3 py-1 rounded-full border capitalize ${form.status===s?'bg-[#4B3621] text-white border-[#4B3621]':'bg-white'}`}>{s}</button>)}</div></div>
          <div><label className="text-xs">{t('addProduct.dimensions')}</label><input name="dimensions" value={form.dimensions} onChange={handleChange} placeholder={t('addProduct.dimensionsPh')} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <div><label className="text-xs">{t('addProduct.materials')}</label><div className="flex flex-wrap gap-2 mt-1 items-center">{materials.map((m,i)=><span key={i} className="border px-2 py-1 rounded-full text-xs flex items-center gap-1">{m} <button type="button" onClick={()=>removeMaterial(i)} className="text-[#B3402E]">✕</button></span>)}<input value={materialInput} onChange={e=>setMaterialInput(e.target.value)} onKeyDown={addMaterial} className="flex-1 min-w-[120px] border rounded-full px-3 py-1 text-xs" placeholder={t('addProduct.materialPh')} /></div></div>
          <div><label className="text-xs">{t('addProduct.description')}</label><textarea name="description" value={form.description} onChange={handleChange} maxLength={1000} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder={t('addProduct.descPh')} /><div className="text-xs text-end text-[#8A8078]">{formatNumber(form.description.length)}/1000</div></div>
          <div className="flex gap-3"><button type="button" onClick={()=>navigate('/dashboard/my-products')} className="border px-4 py-2 rounded-lg text-sm">{t('addProduct.cancel')}</button><button type="submit" disabled={saving || optimizing} className="bg-[#4B3621] text-white px-6 py-2 rounded-lg text-sm disabled:opacity-60">{saving?(isEdit?t('addProduct.updating'):t('addProduct.creating')):optimizing?t('dashboard.optimizing'):(isEdit?t('addProduct.updateProduct'):t('addProduct.saveProduct'))}</button></div>
        </div>
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-4 space-y-3 h-fit">
          <h3 className="text-sm font-medium flex justify-between">{t('addProduct.media')} <span className="text-xs text-[#8A8078]">{t('addProduct.primary')}</span></h3>
          <label className="border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center text-xs text-[#8A8078] cursor-pointer hover:border-[#C19A6B] hover:bg-[#FAF7F2] transition overflow-hidden relative">
            <input accept="image/*" type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleMain} />
            {mainPreview ? <img src={mainPreview} alt="main" className="w-full h-full object-cover rounded-xl" /> : <><span className="material-symbols-outlined">add_photo_alternate</span> {t('addProduct.mainDrop')}</>}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="h-20 border-2 border-dashed rounded-lg flex items-center justify-center text-[10px] cursor-pointer hover:border-[#C19A6B]"><input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />+</label>
            {imagesPreviews.map((src,i)=><div key={i} className="h-20 rounded-lg overflow-hidden relative group border"><img src={src} alt="" className="w-full h-full object-cover" /><button type="button" onClick={()=>removeImage(i)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs">{t('addProduct.remove')}</button></div>)}
          </div>
          <p className="text-[11px] text-[#8A8078]">{t('addProduct.mediaHint')}</p>
          {optimizing && <p className="text-[11px] text-[#78582f]">{t('dashboard.optimizing')}</p>}
          {photoError && <p className="text-[11px] text-[#B3402E]">{photoError}</p>}
        </div>
      </form>
    </div>
  )
}

export default AddEditProduct;
