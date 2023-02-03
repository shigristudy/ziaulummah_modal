<script setup>
import { reactive, onMounted, ref, computed ,createApp} from "vue";
import Api from "./services/api";
import countries from "./data/countries.json";
import Basket from "./components/Basket.vue";
import DonationModal from "./components/DonationModal.vue";
import Footer from "./components/Footer.vue";
import Stripe from "./components/Stripe.vue";
import IconDelete from "./components/icons/IconDelete.vue";
import IconEdit from "./components/icons/IconEdit.vue";
import IconCheck from "./components/icons/IconCheck.vue";
import Paypal from "./components/Paypal.vue";
import QuickBar from "./components/QuickBar.vue";

import { current_donation, form } from "./data/resets";
let state = reactive({
  showModal: false,
  isCartOpened: false,
  isAddDonationOpened: false,
  step: 1,
  selectedItem: null,
  errors: {},
  projects: [],
  locations: [],
  donationTypes: [],
  donations: JSON.parse(localStorage.getItem('synergi-zuf-donations')) ?? [],
  countries,
  totalAmount: 0,
  current_donation: { ...current_donation },
  form: { ...form },
  stripePublicKey: '',
  gateways:[],
  totalDonation: 0,
  donationTotal: 0,
  adminProjects: [],
  quickDonation: {},
  currencies: {"GBP": "£", "USD": "$", "EUR": "€"},
  selected_currency: 'GBP'
});
const donationComponentRef = ref(null)
onMounted(() => {
  getGateways();
  // getProjects();
  // getAdminProjects()
  bindSelectorClick();
  bindProjectSelectorClick();

  bindQuickBar();
  detectWebsite();
});
async function detectWebsite() {
  console.log("here")
  const dom = document.documentElement
  // (window.location.host == 'musafir.org.uk') ? dom.classList.add('dark') : dom.classList.remove('dark')
  // window.addEventListener('DOMContentLoaded', (event) => {
  // });
}

async function bindQuickBar() {

  const quickbar = createApp(QuickBar, {
    onAdded(donation) {
      donationAdded(donation)

      document.getElementById("synergidigital-snackbar").classList.remove('hidden')
      setTimeout(function () {
        document.getElementById("synergidigital-snackbar").classList.add('hidden')
      }, 2000);
    }

  }).mount('#synergidigital-quick-donation')
}

async function getAdminProjects() {
  let { data } = await Api.fetchAdminProjects();
  state.adminProjects = data
}


function bindSelectorClick() {
  if (document.getElementById("synergy-donationModal")) {
    let selector = document
      .getElementById("synergy-donationModal")
      .getAttribute("data-selector");
    let showBasketButton = document.querySelectorAll(".synergidigital-btn-show-basket");
    if (showBasketButton) {
      showBasketButton.forEach((element) => {
        element.addEventListener("click", () => {
          openModel();
        })
      })
    }

    let donation_buttons = document.querySelectorAll(".synergy-btn-show-donation-modal");
    if (donation_buttons) {
      donation_buttons.forEach((element) => {
        element.addEventListener("click", () => {
          openDonationModal();
        });  
      });
    }
  }
}
function bindProjectSelectorClick() {
  if (document.getElementById("synergy-donationModal")) {
    let btnAddToCart = document.querySelector(".synergidigital-btn-add-project-to-cart");
    if (btnAddToCart != null) {
      btnAddToCart.addEventListener("click", (e) => {

        let category_id = parseInt(e.target.getAttribute('data-category-id'))
        let project_id = parseInt(e.target.getAttribute('data-project-id'))
        let amount = parseFloat(e.target.getAttribute('data-amount'))
        let monthly = parseInt(e.target.getAttribute('data-monthly'))
        
        getProjectDetails(category_id,project_id,amount,monthly)
      });
    }
  }
}

async function getProjectDetails(category_id,project_id,amount,monthly) {
  const { data } = await Api.fetchProject(project_id)
  let quick_donation = {
      category_id: category_id,
      project_id: project_id,
      donation_type_id: data.donation_types[0].id,
      amount: amount,
      monthly: monthly,
      fix_amount: 0,
      qty: 1,
      totalAmount: null,
      project: data
  }

  donationAdded(quick_donation)
  document.getElementById("synergidigital-snackbar").classList.remove('hidden')
  setTimeout(function () {
    document.getElementById("synergidigital-snackbar").classList.add('hidden')
  }, 2000);

} 

const hasMonthly = computed(() => {
  return state.donations.some((d) => d.monthly);
});


function addDonation() {
  if (validateDonation()) {
    if (state.selectedItem == null) {
      state.donations = [...state.donations, { ...state.current_donation }];
    } else {
      state.donations[state.selectedItem] = state.current_donation;
      state.selectedItem = null;
    }
    state.current_donation = { ...current_donation };
    state.errors = {};
    stepForward();
  }
}

function stepForward() {
  state.step++;
}

function removeItem(index) {
  state.donations.splice(index, 1);
}

function editItem(index) {
  state.selectedItem = index;
  state.current_donation = state.donations[index];
  state.step = 1;
}

function initAgain() {
  localStorage.removeItem('synergi-zuf-donations')
  state.donations = [];
  state.form = { ...form }
}

function showSuccessPage() {
  // state.firstPage = true
}

function onlyNumber($event) {
  let keyCode = $event.keyCode ? $event.keyCode : $event.which;
  if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) {
    $event.preventDefault();
  }
}

async function getGateways() {
  const { data } = await Api.fetchGateways();
  state.gateways = data
  // state.stripePublicKey = data?.data?.public_key;
}
function openModel() {
  state.isCartOpened = true
}
function openDonationModal() {
  state.isAddDonationOpened = true
}

function assets(asset) {
  return Api.assets(asset);
}

function donationAdded(donation) {
  // console.log(donation)

  if (state.selectedItem == null) {
    state.donations = [...state.donations, { ...donation }];
    localStorage.setItem('synergi-zuf-donations',JSON.stringify(state.donations))
  } else {
    state.donations[state.selectedItem] = state.current_donation;
    state.selectedItem = null;
  } 
}

function toggleCustomProject(type, selected) {
  if (type == "admin_fee") { 
    state.form.admin_fee_cover = selected
    // console.log(type, selected, state.form.admin_fee_cover)
    
  } else {
    state.form.paper_copy = selected
    // console.log(type,selected,state.form.paper_copy)
  }
}

function updateMiniCart(amount) {
  let minicart = document.getElementById("synergy-mini-cart-label");
  if (minicart) {
    minicart.innerText = state.currencies[state.form.selected_currency] + parseFloat(amount).toFixed(2);
  }
}

function addAnotherDonation() {
  state.isCartOpened = false
  state.isAddDonationOpened = true
}
</script>
  
<template>
  <div id="synergy-donation-tailwind">

    <div id="synergidigital-snackbar" class="absolute z-50 bg-green text-white bottom-2 left-1/2 transform -translate-x-1/2 rounded-sm hidden">
      <p class="px-3">Donation Added to Basket</p>
    </div>

    <VueSidePanel v-model="state.isCartOpened" lock-scroll class="md:w-1/3 w-full bg-gray-100">
      <Basket :donations="state.donations" 
            :form="state.form" 
            :currencies="state.currencies" 
            :gateways="state.gateways" 
            :stripePublicKey="state.stripePublicKey"
            @toggleCustomProject="toggleCustomProject" 
            @initAgain="initAgain"
            @addAnotherDonation="addAnotherDonation"
            @totalAmount="updateMiniCart"
            @removeItem="removeItem"/>
    </VueSidePanel>
    <VueSidePanel v-model="state.isAddDonationOpened" lock-scroll class="md:w-1/3 w-full bg-gray-100">
      <DonationModal 
      ref="donationComponentRef"
      :form="state.form" 
      :currencies="state.currencies"
      @added="donationAdded"/>
    </VueSidePanel>
  </div>
</template>