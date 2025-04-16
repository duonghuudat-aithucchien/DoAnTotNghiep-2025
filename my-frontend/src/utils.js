import { orderContant } from "./contant"

export const isJsonString = (data) => {
    try {
        JSON.parse(data)
    } catch (error) {
        return false
    }
    return true
}

export const getBase64 = (file) =>
new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
})

export function getItem(label, key, icon, children, type) {
    return {
        key,
        label,
        icon,
        children,
        type
    }
}

export const renderOptions = (arr) => {
    let results = []
    if(arr) {
        results = arr?.map((opt) => {
            return{
                value: opt,
                label: opt
            }
        })
    }
    results.push({
        label: 'Thêm type',
        value: 'add_type'
    })
    return results

}

export const convertPrice = (price) => {
    try {
        const result = price?.toLocaleString().replaceAll(',', '.')
        return `${result} VND`
    } catch (error) {
        return null
    }
}
export default convertPrice; 

export const convertDataChart = (data, type) => {
    try {
        const object = {}
        Array.isArray(data) && data.forEach((opt) => {
            if(!object[opt[type]]) {
                object[opt[type]] = 1
            } else {
                object[opt[type]] += 1
            }
        })
        const results = Array.isArray(Object.keys(object)) && Object.keys(object).map((item) => {
            return {
                name: orderContant.payment[item],
                value: object[item]
            }
        })
        return results
    } catch(e) {
        return []
    }
    
}

export const convertDataChartByProduct = (data) => {
    try {
      const productRevenueMap = {};
  
      data.forEach(order => {
        order.orderItems.forEach(item => {
          const itemName = item.name;
          const quantity = item.amount;
          const price = item.price;
          const discount = item.discount || 0;
  
          const totalItemRevenue = (price - discount) * quantity;
  
          if (!productRevenueMap[itemName]) {
            productRevenueMap[itemName] = totalItemRevenue;
          } else {
            productRevenueMap[itemName] += totalItemRevenue;
          }
        });
      });
  
      const result = Object.entries(productRevenueMap).map(([name, value]) => ({
        name,
        revenue: value,
      }));
  
      return result;
    } catch (e) {
      console.error('Error in convertDataChartByProduct:', e);
      return [];
    }
  };
  
  