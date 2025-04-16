import React, { useEffect, useState, useCallback  } from 'react'
import { WrapperContainerLeft, WrapperContainerRight, WrapperTextLight } from './style'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import InputForm from '../../components/InputForm/InputForm'
import { Image } from 'antd'
import imageLogo from '../../assets/images/signin.png'
import { EyeFilled, EyeInvisibleFilled} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useMutationHooks } from '../../hooks/useMutationHook'
import Loading from '../../components/LoadingComponent/Loading'
import * as UserSerVice from '../../service/UserService'
import * as message from '../../components/Message/Message'


const SignUpPage = () => {
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isShowConfirmPassWord, setIsShowConfirmPassWord] = useState(false)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')


  const handleOnchangeEmail = (value) => {
    setEmail(value)
  }

  const handleOnchangePassword = (value) => {
    setPassword(value)
  }
  
  const handleOnchangeConfirmPassword = (value) => {
    setConfirmPassword(value)
  }

  const mutation = useMutationHooks(
    data => UserSerVice.SignUpUser(data)

  )

  
  const handleNavigateSignIn = useCallback(() => {
    navigate('/sign-in');
  },[navigate]);

  const handleSignUp = () => {
    mutation.mutate({email, password, confirmPassword})
  }
  console.log('sign-up', email, password, confirmPassword)
  
  const { data, isPending, isSuccess, isError } = mutation
  useEffect(() => {
    if (isSuccess) {
      message.success(); 
      handleNavigateSignIn();
    } else if (isError) {
      message.error();
    }
  }, [isSuccess, data, isError, handleNavigateSignIn]); 
  //console.log(data)
  //console.log('mutation', mutation)


  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.53)', height: '100vh'}}>
      <div style={{width: '800px', height: '445px', borderRadius: '6px', background: '#fff', display: 'flex'}}>
        <WrapperContainerLeft>
          <h1>Xin chào</h1>
          <p>Đăng nhập và tạo tài khoản</p>
          <InputForm style={{marginBottom: '10px'}} placeholder="abc@gmail.com" value={email} onChange={handleOnchangeEmail}/>
          <div style={{position: 'relative'}}>
            <span
              onClick = {() => setIsShowPassword(!isShowPassword)}
              style={{zIndex: 10, position: 'absolute', top: '4px', right: '8px'}}>
              {
                isShowPassword ? (
                  <EyeFilled />
                ) : (
                  <EyeInvisibleFilled />
                )
              }
            </span>
            <InputForm style={{marginBottom: '10px'}} placeholder="password" type={isShowPassword ? "text" : "password"}
              value={password} onChange={handleOnchangePassword}/>
          </div>

          <div style={{position: 'relative'}}>
            <span
              onClick = {() => setIsShowConfirmPassWord(!isShowConfirmPassWord)}
              style={{zIndex: 10, position: 'absolute', top: '4px', right: '8px'}}>
              {
                isShowConfirmPassWord ? (
                  <EyeFilled />
                ) : (
                  <EyeInvisibleFilled />
                )
              }
            </span>
            <InputForm placeholder="comfirm password" type={isShowConfirmPassWord ? "text" : "password"}
              value={confirmPassword} onChange={handleOnchangeConfirmPassword}/>
          </div>

          {data?.status === 'ERR' && <span style={{color: 'red'}}>{data?.message}</span>}
          <Loading isPending={isPending}>
          <ButtonComponent
            disabled={!email.length || !password.length || !confirmPassword.length}
            onClick={handleSignUp}
            size={40}
            styleButton={{background: 'rgb(255,57,69)', height:'48px', width: '100%', border:'none', borderRadius: '4px', margin: '26px 0 10px'}}
            textButton={'Đăng ký'}
            styleTextButton={{color: '#fff',  fontSize:'15px', fontWeight: '700'}}
          ></ButtonComponent>
          </Loading>
              <p>Bạn đã có tài khoản? <WrapperTextLight onClick = {handleNavigateSignIn}>Đăng nhập</WrapperTextLight></p>
        </WrapperContainerLeft>
        <WrapperContainerRight>
          <Image src={imageLogo} preview={false} alt="image-logo" height="203px" width="203px" />
          <h4>Mua sắm tại DUONGHUUDAT</h4>
        </WrapperContainerRight>
      </div>
    </div>
  )
}

export default SignUpPage