export const products = [
  { id:1, name:'Lounge Chair No. 5', gallery:'Studio Kairo', price:2450, compare:2950, stock:12, status:'active', featured:true, category:'Sofas', image:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80', desc:'Handcrafted lounge chair in espresso oak with ivory boucle.' },
  { id:2, name:'Brass Halo Table', gallery:'Maison Éthéré', price:4800, compare:5200, stock:3, status:'active', featured:true, category:'Tables', image:'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80', desc:'Sculptural brass coffee table with brushed finish.' },
  { id:3, name:'Bouclé Ottoman', gallery:'Nordic Living', price:1250, stock:0, status:'draft', featured:false, category:'Seating', image:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', desc:'Textured bouclé ottoman in sand, low profile.' },
  { id:4, name:'Walnut Curve Chair', gallery:'Artisan Collective', price:1890, stock:7, status:'active', featured:false, category:'Seating', image:'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80', desc:'Walnut veneer dining chair with curved backrest.' },
  { id:5, name:'Linen Sofa', gallery:'Cairo Living', price:9000, stock:5, status:'active', featured:true, category:'Sofas', image:'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=600&q=80', desc:'3-seater linen sofa, deep seat.' },
  { id:6, name:'Oak Dining Table', gallery:'Walnut House', price:12500, stock:2, status:'active', featured:true, category:'Tables', image:'https://images.unsplash.com/photo-1615066028040-4fffa29c3e27?auto=format&fit=crop&w=600&q=80', desc:'Solid oak dining table W 200 × D 90 × H 75 cm' },
]
export const galleries = [
  { id:1, name:'Studio Kairo', city:'Cairo, Egypt', products:12, logo:'SK', banner:'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80' },
  { id:2, name:'Maison Éthéré', city:'Paris, France', products:24, logo:'MÉ', banner:'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80' },
  { id:3, name:'Nordic Living', city:'Copenhagen, Denmark', products:18, logo:'NL', banner:'https://images.unsplash.com/photo-1616046229478-9901c5536daa?auto=format&fit=crop&w=1200&q=80' },
  { id:4, name:'Walnut House', city:'Milan, Italy', products:9, logo:'WH', banner:'https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?auto=format&fit=crop&w=1200&q=80' },
]
export const orders = [
  { id:'ORD-1024', date:'Aug 24, 2026', customer:'Alexandra Hayes', gallery:'Walnut House', total:2980, status:'pending', items:2 },
  { id:'ORD-1023', date:'Aug 22, 2026', customer:'Omar Nabil', gallery:'Studio Kairo', total:2450, status:'accepted', items:1 },
  { id:'ORD-1022', date:'Aug 20, 2026', customer:'Layla M.', gallery:'Cairo Living', total:900, status:'rejected', items:1 },
  { id:'ORD-1021', date:'Aug 18, 2026', customer:'Alexandra Hayes', gallery:'Maison Éthéré', total:4800, status:'cancelled', items:1 },
]
export const users = [
  { name:'Alexandra Hayes', email:'alex@atelier.test', role:'Admin', status:'active', avatar:'AH' },
  { name:'Youssef Gallery', email:'owner@walnut.test', role:'Gallery Owner', status:'active', avatar:'YG' },
  { name:'Sara Employee', email:'sara@walnut.test', role:'Employee', status:'active', avatar:'SE' },
  { name:'Omar Customer', email:'omar@test.com', role:'Customer', status:'active', avatar:'OC' },
]
