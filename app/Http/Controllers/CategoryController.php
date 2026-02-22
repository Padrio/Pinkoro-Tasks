<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Http\Requests\ReorderCategoriesRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function store(CategoryRequest $request): RedirectResponse
    {
        $maxOrder = Category::max('sort_order') ?? 0;

        Category::create([
            ...$request->validated(),
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
