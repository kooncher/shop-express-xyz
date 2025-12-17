export const usePageTitle = () => {
  const { getShopSettings } = useSettings()

  const setPageTitle = async (pageTitle?: string) => {
    const { data } = await getShopSettings()
    const shopName = data?.shop_name || 'ShopSystem'
    
    if (pageTitle) {
      useHead({
        title: `${pageTitle} - ${shopName}`
      })
    } else {
      useHead({
        title: shopName
      })
    }
  }

  return {
    setPageTitle
  }
}