<script setup lang="ts">
import { ref } from 'vue'
import logo from '../public/logo.png';
import { serverClient, ActionOutput } from 'oc-server'
const props = defineProps<{ userId: number, firstName: string, lastName: string }>()

const additionalData = ref<ActionOutput<'getMoreData'> | null>(null);
async function getAdditionalData() {
  additionalData.value = await serverClient.getMoreData({ userId: props.userId });
}
</script>

<template>
  <div className="container">
    <img width="50" height="50" v-bind:src="logo" alt="Logo" />

    <h1>
      Hello, <span>{{ firstName }}</span> {{ lastName }}
    </h1>
    <div className={styles.info} v-if="additionalData">
      <div className={styles.block}>Age: {{ additionalData.age }}</div>
      <div className={styles.block}>
        Hobbies:
        <span v-for="hobby in additionalData.hobbies" :key="hobby">
          {{ hobby.toLowerCase() }}
        </span>
      </div>
    </div>
    <button className="button" @click="getAdditionalData">
      Get extra information
    </button>
  </div>
</template>

<style scoped>
.container {
  background-color: #3b246c;
  color: #fff;
  font-family: sans-serif;
  padding: 40px;
}

.button {
  background-color: #a97613;
  border: none;
  padding: 15px 32px;
  text-align: center;
  font-size: 16px;
  text-decoration: none;
  display: inline-block;
  color: inherit;
  cursor: pointer;
}

h1 {
  margin: 0 0 20px 0;
}

span {
  text-decoration: underline;
}
</style>
