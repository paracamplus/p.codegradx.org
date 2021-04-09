<PersonsList
  entryPointName='listStudents'
  entryKeyName='students'
  bind:showPersonsList={showPersonsList} />

<script>
  import PersonsList from '../components/PersonsList.svelte';

 export let showPersonsList = false;

</script>
