import axios from "axios"

const serve = axios.create({
    //baseURL: "http://a383f24e2aa7548eda410f9c34041802-1913302708.ap-northeast-1.elb.amazonaws.com:8082/api",
    baseURL: "http://localhost:3000",
    timeout: 5000,
})

// 设置post请求头
serve.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded;charset=UTF-8 ";

// 请求拦截器
serve.interceptors.request.use(
  (config) => {
    // 根据本地是否存在token判断用户的登录状况
    // 每次请求都携带token，这个请求是否需要token由后台去判断
    const token = "abce";
    token &&
      config.headers &&
      (config.headers.Authorization = "Bearer " + token);
    token && config.headers && (config.headers.token = "Bearer " + token);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleError = async (status: number | undefined) => {
  switch (status) {
    case 500:
      // ElMessage.error("操作错误");
      break;
    case 506:
      console.log("参数检验失败");
      break;
    case 401:
      console.log("token过期");
      //loginstore.changeShowLoginStatus(true);
      break;
    case 403:
      console.log("没有相关权限");
      break;
    default:
      // console.log("成功");
      break;
  }
};

serve.interceptors.response.use((res) => {
  handleError(res.data.code);
  return res;
});
export default serve;