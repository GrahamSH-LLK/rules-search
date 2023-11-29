<script>
  import "../app.css";
</script>

<nav class="bg-indigo-900">
  <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
    <div class="relative flex h-16 items-center justify-between">
      <div
        class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start"
      >
        <div class="flex flex-shrink-0 items-center">
          <a class="font-black text-white text-2xl" href="/">FRC Rules Search</a
          >
        </div>
        <div class="hidden sm:ml-6 sm:block">
          <div class="flex space-x-4">
            <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
            <!--<a href="#" class="bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium" aria-current="page">Dashboard</a>-->
          </div>
        </div>
      </div>
      <div
        class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0"
      ></div>
    </div>
  </div>

  <!-- Mobile menu, show/hide based on menu state. -->
</nav>
<div class="mx-auto px-2 sm:px-6 lg:px-8 max-w-7xl">
  <slot />
</div>
