import React from 'react'
import { WrapperContent, WrapperLableText, WrapperTextPrice, WrapperTextValue } from './style'
import { Checkbox, Rate } from 'antd'

const NavbarComponent = () => {
    const onChange = () => { }
    const renderContent = (type, options) => {
        switch(type) {
            case 'text':
                return options.map((option) => {
            
                    return (
                        <WrapperTextValue>{option}</WrapperTextValue>
                    )
                
                })
            case 'checkbox':
                return (
                    <Checkbox.Group
                        style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        }}
                        onChange={onChange}
                    >
                        {options.map((option) => {
                            return (
                                <Checkbox value={option.value}>{option.lable}</Checkbox>

                            )
                        })}
                        <Checkbox value="B">B</Checkbox>
            
                    </Checkbox.Group>
                )
            case 'start':
                return options.map((option) => {
                    console.log('check', option)
                    return (
                        <div style={{display: 'flex', gap: '4px'}}>
                            <Rate style={{fontSize: '12px'}} disabled defaultValue={option} />
                            <span>{`từ ${option} sao`}</span>
                        </div>
                    )
                })

            case 'price':
                return options.map((option) => {
                    return(
                        <WrapperTextPrice>{option}</WrapperTextPrice>
                    )
                })
            default:
                return {}
        }
    }

  return (
    <div>
        <WrapperLableText>Tuỳ chọn</WrapperLableText>
        <WrapperContent>
            {renderContent('text', ['Thời trang nam', 'Thời trang nữ'])}
            
        </WrapperContent>
        
    </div>
  )
}

export default NavbarComponent