let current_donation = {
    category_id: 0,
    project_id: 0,
    donation_type_id:'',
    amount: null,
    monthly: false,
    fix_amount: 0,
    qty: 1,
    totalAmount: null,
    project: null,
    is_other_amount_allowed:null
}

let form = {
    first_name: null,
    last_name: null,
    address_line_1: null,
    address_line_2: null,
    city: null,
    post_code: null,
    country: 0,
    email: null,
    phone: null,
    reason: null,
    notes: null,
    gift_aid: 0,
    contact_medium: [],
    payment_type: null,
    date: new Date().toJSON().slice(0, 10).replace(/-/g, '-'),
    paper_copy: false,
    admin_fee_cover: false,
    terms_agreement: false,
    selected_currency: 'GBP',
    capture_url: window.location.href
}


export { current_donation,form };
