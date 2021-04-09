<PersonsList
  entryPointName='listTeachers'
  entryKeyName='teachers'
  bind:showPersonsList={showPersonsList} />

<script>
  import PersonsList from '../components/PersonsList.svelte';

  export let showPersonsList = false;
</script>
