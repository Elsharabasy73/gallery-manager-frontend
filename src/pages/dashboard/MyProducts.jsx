import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyGallery } from '../../api/galleries';
import { getProductImageUrl } from '../../utils/image';
import { apiFetch } from '../../api/client';
import { unwrapProducts, deleteProduct } from '../../api/products';
import { useLanguage } from '../../i18n/LanguageContext';
import Pagination from '../../components/Pagination';

export function MyProducts(){
  const navigate = useNavigate()
  const { t, formatPrice, formatNumber } = useLanguage()
  const [filter,setFilter]=useState('All')
  const [search,setSearch]=useState('')
  const [galleryId,setGalleryId]=useState(null)
  const [productsList,setProductsList]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [deletingId,setDeletingId]=useState(null)
  const [actionMsg,setActionMsg]=useState('')
  const [actionError,setActionError]=useState(false)
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
        else setError(t('myProducts.noGallery'))
      }catch(err){
        if(cancelled) return
        if(err?.status===404) setError(t('myProducts.noGalleryShort'))
        else setError(err.message||t('myProducts.loadFail'))
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
        setError(err.message||t('myProducts.loadFail'))
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

  const handleDelete = async (productId) => {
    if (!confirm(t('admin.deleteProductConfirm'))) return
    setDeletingId(productId)
    setActionMsg('')
    setActionError(false)
    try {
      await deleteProduct(productId)
      setProductsList(prev => prev.filter(p => String(p.id || p._id) !== String(productId)))
      setActionMsg(t('admin.productDeleted'))
    } catch (err) {
      setActionError(true)
      setActionMsg(err.message || t('admin.deleteFail'))
    } finally {
      setDeletingId(null)
    }
  }

  if(!galleryId && loading) return <div className="text-center py-16 text-sm text-[#8A8078]">{t('myProducts.loadGallery')}</div>
  if(error && !galleryId) return <div className="text-center py-16 bg-white border rounded-xl"><p className="text-sm text-[#8A8078]">{error}</p><button onClick={()=>navigate('/dashboard/create-gallery')} className="mt-3 bg-[#4B3621] text-white px-4 py-2 rounded-lg text-sm">{t('myProducts.createGallery')}</button></div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-xl">{t('myProducts.title')}</h2>
        <button onClick={()=>navigate('/dashboard/add-product')} className="bg-[#4B3621] text-white px-4 py-1.5 rounded-full text-sm">{t('myProducts.add')}</button>
      </div>
      {actionMsg && <div className={`text-sm px-4 py-2 rounded-lg ${actionError?'bg-[#ffdad6] text-[#93000a]':'bg-green-50 text-green-800'}`}>{actionMsg}</div>}
      <div className="flex gap-2">
        {['All','Active','Draft','Archived'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1 rounded-full text-xs border ${filter===f?'bg-[#4B3621] text-white':'bg-white'}`}>{f}</button>
        ))}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('myProducts.searchPh')} className="ms-auto border rounded-full px-3 py-1 text-xs" />
      </div>
      {error && <div className="bg-[#ffdad6] border border-[#B3402E]/20 text-[#93000a] text-sm px-4 py-2 rounded-lg">{error}</div>}
      {loading ? <div className="text-center py-12 text-sm text-[#8A8078]">{t('myProducts.loading')}</div> : filtered.length===0 ? <div className="text-center py-12 bg-white border border-dashed rounded-xl text-sm text-[#8A8078]">{t('myProducts.empty')} {search?t('myProducts.forSearch', { q: search }):''} — <button onClick={()=>navigate('/dashboard/add-product')} className="text-[#C19A6B] underline">{t('myProducts.addFirst')}</button></div> : (
      <div className="bg-white border border-[#E7DFD3] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF7F2] text-xs text-[#8A8078]"><tr><th className="text-start p-3">{t('myProducts.thProduct')}</th><th>{t('myProducts.thCategory')}</th><th>{t('myProducts.thPrice')}</th><th>{t('myProducts.thStock')}</th><th>{t('myProducts.thStatus')}</th><th>{t('myProducts.thActions')}</th></tr></thead>
            <tbody>
              {filtered.map(p=>{
                const displayImg = getProductImageUrl(p) || p.image || 'https://via.placeholder.com/40'
                const cat = p.category?.name || (typeof p.category==='string'?p.category:'')
                return (
                <tr key={p.id||p._id} className="border-t">
                  <td className="p-3 flex items-center gap-2"><img src={displayImg} alt={p.name} className="w-10 h-10 rounded object-cover" onError={e=>e.target.style.display='none'} />{p.name}</td>
                  <td className="text-center text-xs">{cat || '—'}</td>
                  <td className="text-center">{formatPrice(p.price)}</td>
                  <td className={`text-center ${Number(p.stock)<=3?'text-amber-600':''}`}>{p.stock ?? '—'}</td>
                  <td className="text-center"><span className={`px-2 py-0.5 rounded-full text-[11px] ${String(p.status).toLowerCase()==='active'?'bg-green-100 text-green-800': String(p.status).toLowerCase()==='draft'?'bg-amber-100 text-amber-800':'bg-zinc-100'}`}>{p.status || '—'}</span></td>
                  <td className="text-center"><button onClick={()=>navigate(`/dashboard/add-product?id=${p.id||p._id}`)} className="text-xs border px-2 py-1 rounded me-1">{t('common.edit')}</button><button onClick={()=>handleDelete(p.id||p._id)} disabled={String(deletingId)===String(p.id||p._id)} className="text-xs text-[#B3402E] disabled:opacity-60">{String(deletingId)===String(p.id||p._id)?t('common.deleting'):t('common.delete')}</button></td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        {pagination && (
          <div className="p-3 border-t">
            <Pagination
              pagination={pagination}
              page={page}
              onPageChange={(newPage) => setPage(newPage)}
              showFirstLast={true}
            />
          </div>
        )}
      </div>
      )}
    </div>
  )
}

export default MyProducts;
