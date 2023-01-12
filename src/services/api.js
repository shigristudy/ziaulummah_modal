import axios from "axios";

let accessToken = null;
let clientId = null;

if (document.getElementById("donationModal")) {
  accessToken = document
    .getElementById("donationModal")
    .getAttribute("data-access-token");

  clientId = document
    .getElementById("donationModal")
    .getAttribute("data-client-id");
}

// // Request interceptor
// axios.interceptors.request.use((request) => {
//   request.headers.common["X-Client-ID"] = clientId;
//   request.headers.common["X-Token"] = accessToken;
//   return request;
// });

const url = (api) => {
  return import.meta.env.VITE_APP_URL+"/api/modal/" + api;
};
export default {
  saveDonation(payload) {
    return axios.post(url("donations"), payload);
  },
  makePayment(payload) {
    return axios.post(url("payments/pay"), payload);
  },
  fetchCategories() {
    return axios.get(url("categories"));
  },
  fetchProjects(category_id) {
    return axios.get(url(`project-by-category/${category_id}`));
  },
  fetchAllProjects() {
    return axios.get(url(`projects`));
  },
  fetchProject(project_id) {
    return axios.get(url(`project/${project_id}`));
  },
  fetchGatewayKey(gateway){
    return axios.get(url(`payments/gateways/${gateway}/key`));
  },
  assets(asset) {
    return import.meta.env.VITE_ASSETS_URL+ "/" + asset;
  },
  fetchAdminProjects() {
    return axios.get(url(`admin-projects`));
  },
  getQuickDonationProject() {
    return axios.get(url('get-quick-donation-project'))
  }
};
