import { MenuFiltersProvider } from "@/features/menu/context/MenuFiltersContext";
import FilterOverlay from "@/features/menu/components/FilterOverlay";
import FilterPanel from "@/features/menu/components/FilterPanel";
import FilterToggleButton from "@/features/menu/components/FilterToggleButton";
import MenuHeading from "@/features/menu/components/MenuHeading";
import MenuSearchBar from "@/features/menu/components/MenuSearchBar";
import ProductGrid from "@/features/menu/components/ProductGrid";

export default function MenuPage() {
    return (
        <MenuFiltersProvider>
            <div className="pb-(--spacing-gutter) md:pb-0">
                <MenuHeading />
                <MenuSearchBar />
                <section className="relative mx-auto max-w-(--container-max) px-(--spacing-margin-mobile) md:flex md:gap-8 md:px-(--spacing-margin-desktop)">
                    <FilterToggleButton />
                    <FilterPanel />
                    <FilterOverlay />
                    <ProductGrid />
                </section>
            </div>
        </MenuFiltersProvider>
    );
}
