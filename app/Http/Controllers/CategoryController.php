<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Http\Requests\ReorderCategoriesRequest;
use App\Models\Category;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function store(CategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $parentId = $validated['parent_id'] ?? null;

        $maxOrder = Category::query()
            ->when($parentId !== null,
                fn ($q) => $q->where('parent_id', $parentId),
                fn ($q) => $q->whereNull('parent_id'),
            )
            ->max('sort_order') ?? 0;

        Category::create([
            ...$validated,
            'sort_order' => $maxOrder + 1,
        ]);

        return back();
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        return back();
    }

    public function destroy(Category $category): RedirectResponse
    {
        // When deleting a parent category, uncategorize tasks of its children
        $childIds = $category->children()->pluck('id');
        if ($childIds->isNotEmpty()) {
            Task::whereIn('category_id', $childIds)->update(['category_id' => null]);
            Category::whereIn('id', $childIds)->delete();
        }

        // Uncategorize direct tasks
        Task::where('category_id', $category->id)->update(['category_id' => null]);

        $category->delete();

        return back();
    }

    public function reorder(ReorderCategoriesRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            foreach ($request->order as $index => $id) {
                Category::where('id', $id)->update(['sort_order' => $index]);
            }
        });

        return back();
    }
}
