export const useProducts = () => {
  const { $supabase } = useNuxtApp()

  // Get all products with filters
  const getProducts = async (filters: any = {}) => {
    try {
      let query = $supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      return { data, error }
    } catch (error) {
      console.error('Error in getProducts:', error)
      return { data: null, error }
    }
  }

  // Get categories
  const getCategories = async () => {
    try {
      const { data, error } = await $supabase
        .from('categories')
        .select('*')
        .order('name')

      return { data, error }
    } catch (error) {
      console.error('Error in getCategories:', error)
      return { data: null, error }
    }
  }

  // Create product
  const createProduct = async (productData: any) => {
    try {
      const { data, error } = await $supabase
        .from('products')
        .insert(productData)
        .select(`
          *,
          category:categories(id, name)
        `)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error in createProduct:', error)
      return { data: null, error }
    }
  }

  // Update product
  const updateProduct = async (id: string, productData: any) => {
    try {
      const { data, error } = await $supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          category:categories(id, name)
        `)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error in updateProduct:', error)
      return { data: null, error }
    }
  }

  // Delete product
  const deleteProduct = async (id: string) => {
    try {
      const { error } = await $supabase
        .from('products')
        .delete()
        .eq('id', id)

      return { error }
    } catch (error) {
      console.error('Error in deleteProduct:', error)
      return { error }
    }
  }

  // Upload image to Supabase Storage
  const uploadProductImage = async (file: File, productId?: string) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${productId || Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `products/${fileName}`

      // Upload file to Supabase Storage
      const { data, error } = await $supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = $supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      return { data: { path: filePath, url: publicUrl }, error: null }
    } catch (error) {
      console.error('Error in uploadProductImage:', error)
      return { data: null, error }
    }
  }

  // Delete image from Storage
  const deleteProductImage = async (filePath: string) => {
    try {
      const { error } = await $supabase.storage
        .from('product-images')
        .remove([filePath])

      return { error }
    } catch (error) {
      console.error('Error in deleteProductImage:', error)
      return { error }
    }
  }

  return {
    getProducts,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    deleteProductImage
  }
}