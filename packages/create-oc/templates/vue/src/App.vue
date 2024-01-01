<script setup lang="ts">
import { ref } from 'vue'
import logo from '../public/logo.png';
import { serverClient, InitialData, ActionOutput } from 'oc-server'
const props = defineProps<{ firstName: string, lastName: string, born: number, hobbies: string[] }>()

const additionalData = ref<ActionOutput<'funFact'> | null>(null);
async function getFunFact() {
  additionalData.value = await serverClient.funFact({ year: props.born });
}
</script>

<template>
  <div className="container">
    <img width="50" height="50" v-bind:src="logo" alt="Logo" />

    <h1>
      Hello, <span>{{ firstName }}</span> {{ lastName }}
    </h1>
    <div className={styles.info}>
      <div className={styles.block}>Born: {{ born }}</div>
      <div className={styles.block}>
        Hobbies:
        <span v-for="hobby in hobbies" :key="hobby">
          {{ hobby.toLowerCase() }}
        </span>
      </div>
    </div>
    <div v-if="additionalData">{{ additionalData?.funFact }}</div>
    <button className="button" @click="getFunFact">
      Fun year fact
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
