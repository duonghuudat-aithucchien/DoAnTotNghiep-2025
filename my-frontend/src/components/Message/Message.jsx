import { message } from 'antd';

const success = (mes = 'Success') => {
    message.success(mes);
}

const error = (mes = 'Error') => {
    message.error(mes);
}

const warning = (mes = 'Warning') => {
    message.warning(mes)
}

const info = (mes = 'Info') => {
    message.info(mes);
}

export { success, error, warning, info }