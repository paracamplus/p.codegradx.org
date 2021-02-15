<style>
</style>

<section class='w3-container'>
  <div class='smallHint'>
    Votre réponse tient en la seule ligne qui suit:
  </div>

  <form class='w3-form w3-padding-16'
        accept-charset='UTF-8' enctype='multipart/form-data'>
    <div>
      <input type='text' name='content' class='w3-input'
             id='answerString' width='{file.initial.$.width || '80%'}'
             bind:value={value} />
    </div>
    <div class='w3-center w3-padding-16'>
      <button class='w3-button w3-round-xxlarge w3-theme-l4'
              name='SuBmIt' on:click={sendString} >
        Noter ma réponse
      </button>
    </div>
  </form>

  <Problem bind:error={error}
           within='SingleLineString' />

</section>

<script>
 import Problem from './Problem.svelte';
 
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx/exercise';
 
 export let exercise = undefined;
 export let file = undefined;
 let value = undefined;
 let error = undefined;

  onMount(() => {
   value = file.initial._ || '';
 });

 function sendString (event) {
   event.preventDefault();
   event.stopPropagation();
   error = undefined;
   try {
     dispatch('jobPromise', {jobPromise: null});
     const jobPromise = exercise.sendStringAnswer(value);
     dispatch('jobPromise', {jobPromise});
   } catch (exc) {
     console.log('SingleFile sendFile', exc);
     error = "Je n'ai pas réussi à envoyer votre réponse!";
   }
 }
</script>
