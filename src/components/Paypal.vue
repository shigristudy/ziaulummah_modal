<template>
  <div>
    <div ref="paypal"></div>
    <div class="my-6 flex justify-center">
      <button type="button" @click="moveBack()" class="px-6 pt-2.5 pb-2 bg-gray-600 text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green hover:shadow-lg focus:bg-green focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 mr-3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Back
      </button>
    </div>

  </div>
</template>
<script>
export default {
  props:{
    donations: {
      type: Array,
      default:null
    },
    projects:{
      type: Array,
      default: []
    },
    form: {
      type: Object,
      default:{}
    },
    paypalPublicKey: {
      type: String,
      default:""
    }
    
  },
  data() {
    return {
      loaded: false,
      paidFor: false,
      purchase_units: [],
      static_projects: {
        admin_fee: {
          reference_id: 'admin_fee_cover',
          description: 'Admin Fee Cover',
          amount: {
            currency_code: this.form.selected_currency,
            value: 5
          }
        },
        paper_copy: {
          reference_id: 'paper_copy',
          description: 'Paper Copy',
          amount: {
            currency_code: this.form.selected_currency,
            value: 3
          }
        }
      }
    };
  },
  mounted() {
    this.makeDonationProduct()
    const link =
      `https://www.paypal.com/sdk/js?client-id=${this.paypalPublicKey}&disable-funding=credit,card&currency=${this.form.selected_currency}`;
    const script = document.createElement("script");
    script.src = link;
    script.addEventListener("load", this.setupPaypal);
    document.body.appendChild(script);
  },
  methods: {
    moveBack() {
      this.$emit('moveBack')
    },
    makeDonationProduct(){
      this.purchase_units = []

      if (this.form.admin_fee_cover) {
        this.purchase_units.push(this.static_projects.admin_fee)
      }
      
      if (this.form.paper_copy) {
        this.purchase_units.push(this.static_projects.paper_copy)
      }

      this.donations.map((donation, index) => {
        let amount = (donation.amount) ? donation.amount : donation.fix_amount 
        this.purchase_units.push({
          reference_id: this.getReferenceId(donation.project,index),
          description: donation.project.title,
          amount: {
            currency_code: this.form.selected_currency,
            value: amount
          }
        })  
      })
      
    },
    getReferenceId(project, index) {
      return index + '_' + project.title;
    },
    setupPaypal() {
      this.loaded = true;
      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: this.purchase_units
            });
          },
          onApprove: async (data, actions) => {
            const order = await actions.order.capture();
            this.$emit('PaymentSuccess', order)
            this.paidFor = true;
            console.log(order);

          },
          onError: (err) => {
            this.$emit('PaymentFailed', err)
            console.log(err);
          },
        })
        .render(this.$refs.paypal);
    },
  },
};
</script>
