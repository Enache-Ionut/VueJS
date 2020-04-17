// Before you create app
Vue.config.devtools = true;

var eventBus = new Vue()

Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true
    }
  },
  template:`
    <div class="product">

      <div class="product-image">
        <img :src="image" />
      </div>

      <div class="product-info">
        <h1>{{ title }}</h1>
        <p v-if="inStock">In Stock</p>
        <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
        <p>Shipping : {{ shipping }}

        <h2>Description</h2>
        <product-details :details="details"></product-details>

        <h2>Choose your size</h2>
        <product-sizes :sizes="sizes"></product-sizes>

        <div v-for="(variant, index) in variants" 
          :key="variant.variantId" 
          class="color-box"
          :style="{ backgroundColor: variant.variantColor }" 
          @mouseover="updateProduct(index)">
        </div>

        <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Add to Cart</button>
        <button v-on:click="removeFromCart">Remove</button>

      </div>

      <product-tabs :reviews="reviews"></product-tabs>

    </div>
  `,
  data() {
    return{
      choosenSize: null,
      brand: 'Vue Mastery',
      product: 'Socks',
      selectedVariant: 0,
      details: ['80% cotton', '20% polyester', 'Gender-neutral'],
      variants: [{
          variantId: 2234,
          variantColor: 'green',
          variantImage: './assets/vmSocks-green.jpg',
          variantQuantity: 10
        },
        {
          variantId: 2235,
          variantColor: 'blue',
          variantImage: './assets/vmSocks-blue.jpg',
          variantQuantity: 5
        }
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
      reviews: []
    }
  },
  methods: {
    addToCart: function () {
      this.$emit('add-to-cart',
        this.variants[this.selectedVariant].variantId);
    },
    updateProduct: function (index) {
      this.selectedVariant = index;
      console.log(index);
    },
    removeFromCart: function () {
      this.$emit('remove-from-cart', 
        this.variants[this.selectedVariant].variantId);
    }
  },
  computed: {
    title() {
      return this.brand + ' ' + this.product;
    },
    image() {
      return this.variants[this.selectedVariant].variantImage;
    },
    inStock() {
      return this.variants[this.selectedVariant].variantQuantity;
    },
    shipping() {
      if(this.premium){
        return "Free";
      }
      return 2.99;
    }
  },
  mounted() {
    eventBus.$on('review-submitted', productReview => {
      this.reviews.push(productReview)
    })
  }
})

Vue.component('product-details', {
  props: {
    details: {
      type: Array,
      required: true
    }
  },
  template: `
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
  `
})

Vue.component('product-sizes', {
  props: {
    sizes: {
      type: Array,
      required: true
    }
  },
  template: `
    <div v-for="size in sizes">
      <input  class="display-in-line"  
              type="radio" 
              v-model="choosenSize" 
              :value="size"
              :key="size.id">
      <label  class="display-in-line" 
              for="choosenSize">{{size}}
      </label>
    </div>
  `,
  data() {
    return {
      choosenSize: null
    }
  }
})


Vue.component('product-review', {
  template: `
    <form class="review-form" @submit.prevent="onSubmit">
      
      <p v-if="errors.length">
        <b> Please complete the fallowing required fields:</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>
    
      <p>
        <lable for="name">Name</lable>
        <input id="name" v-model="name">
      </p>
      <p>
        <lable for="review">Review</lable>
        <textarea id="review" v-model="review"></textarea>
      </p>
      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>
      <p>
        <input type="submit" value="Submit">
      </p>
    </form>
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      errors: []
    }
  },
  methods: {
    onSubmit: function() {
      
      this.errors = []
      if( this.name && this.review && this.rating ){
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating
        }
        eventBus.$emit('review-submitted', productReview)

        this.name = null
        this.review = null
        this.rating = null
      }
      else{
        if(!this.name){
          this.errors.push("Name required.")
        }
        if(!this.review){
          this.errors.push("Review required.")
        }
        if(!this.rating){
          this.errors.push("Rating required")
        }
      }
    }
  }
})


Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: `
    <div>    
      <span class="tab"
            :class="{ activeTab: selectedTab === tab }"
            v-for="(tab, index) in tabs"
            :key="index" 
            @click="selectedTab = tab"
      >{{ tab }}</span>

      <div v-show="selectedTab === 'Reviews'">
        <h2>Reviews</h2>
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul>
          <li v-for="review in reviews">
            <p>{{ review.name }}</p>
            <p>{{ review.rating }}</p>
            <p>{{ review.review }}</p>
          </li>
        </ul>
      </div>
      
      <product-review v-show="selectedTab === 'Make a Review'"></product-review>

    </div>
  `,
  data() {
    return {
      tabs: ['Reviews', 'Make a Review'],
      selectedTab: 'Reviews'
    }
  }
})


var app = new Vue({
  el: '#app',
  data: {
    premium: true,
    cart: []
  },
  methods: {
    updateCart: function (id) {
      this.cart.push(id);
    },
    removeItem: function(id) {
      for(let i = this.cart.length; i >= 0; --i){
        if(this.cart[i] == id){
          this.cart.splice(i, 1);
          break;
        }
      }
    }
  }
})
