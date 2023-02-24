import axios from "axios";

let accessToken = null;
let clientId = null;
let website = null;

if (document.getElementById("synergy-donationModal")) {
  accessToken = document
    .getElementById("synergy-donationModal")
    .getAttribute("data-access-token");

  clientId = document
    .getElementById("synergy-donationModal")
    .getAttribute("data-client-id");
  
    website = document
    .getElementById("synergy-donationModal")
    .getAttribute("data-website");
  
}

// Request interceptor
axios.interceptors.request.use((request) => {
  request.headers["X-Client-ID"] = clientId;
  request.headers["X-Token"] = accessToken;
  request.headers["X-Source-Site"] = website;
  return request;
});

const url = (api) => {
  return import.meta.env.VITE_APP_URL + "/api/modal/" + api;
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
  fetchGateways() {
    return axios.get(url(`payments/gateways`));
  },
  assets(asset) {
    return import.meta.env.VITE_ASSETS_URL + "/" + asset;
  },
  fetchAdminProjects() {
    return axios.get(url(`admin-projects`));
  },
  getQuickDonationProject() {
    return axios.get(url("get-quick-donation-project"));
  },
  gocardlessHostedUrl(payload) {
    return axios.post(url("gocardless-hosted-url"), payload);
  },
  createStripeIntentRequest(payload) {
    return axios.post(url('stripe/payment/intent'), payload);
  }
};
