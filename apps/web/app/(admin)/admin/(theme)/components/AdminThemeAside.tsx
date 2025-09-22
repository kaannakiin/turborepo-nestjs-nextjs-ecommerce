"use client";
import CategoryGridForm from "@/(admin)/components/AdminThemeAsideForms/CategoryGridForm";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ActionIcon,
  Button,
  ColorInput,
  Group,
  Paper,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { $Enums } from "@repo/database";
import {
  Control,
  Controller,
  FormState,
  SubmitHandler,
  useFieldArray,
  UseFormHandleSubmit,
} from "@repo/shared";
import {
  CategoryGridComponentType,
  FontFamily,
  MainPageComponentsType,
  MarqueeType,
  ProductListComponentType,
  SliderType,
} from "@repo/types";
import { IconEdit, IconGripVertical, IconTrash } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { getFontFamilyLabel } from "../../../../../lib/helpers";
import MarqueeForm from "../../../components/AdminThemeAsideForms/MarqueeForm";
import ProductListForm from "../../../components/AdminThemeAsideForms/ProductListForm";
import SliderForm from "../../../components/AdminThemeAsideForms/SliderForm";

type ComponentState =
  | "slider"
  | "marquee"
  | "product_list"
  | "category_grid"
  | "add"
  | "edit";

type SliderComponent = {
  type: typeof $Enums.LayoutComponentType.SLIDER;
  layoutOrder: 1;
  data: (SliderType & { order: number })[];
};

type MarqueeComponent = {
  type: typeof $Enums.LayoutComponentType.MARQUEE;
  layoutOrder: number;
  data: MarqueeType;
};

type ProductListComponent = {
  type: typeof $Enums.LayoutComponentType.PRODUCT_LIST;
  layoutOrder: number;
  data: ProductListComponentType;
};

type CategoryGridComponent = {
  type: typeof $Enums.LayoutComponentType.CATEGORY_GRID;
  layoutOrder: number;
  data: CategoryGridComponentType;
};

type LayoutComponent =
  | SliderComponent
  | MarqueeComponent
  | ProductListComponent
  | CategoryGridComponent;

interface AdminThemeAsideProps {
  control: Control<MainPageComponentsType>;
  data: MainPageComponentsType;
  onSubmit: SubmitHandler<MainPageComponentsType>;
  handleSubmit: UseFormHandleSubmit<MainPageComponentsType>;
  formState: FormState<MainPageComponentsType>;
}

const getUniqueId = (comp: LayoutComponent): string => {
  if (comp.type === $Enums.LayoutComponentType.MARQUEE) {
    return comp.data.uniqueId;
  }
  if (comp.type === $Enums.LayoutComponentType.PRODUCT_LIST) {
    return comp.data.uniqueId;
  }
  if (comp.type === $Enums.LayoutComponentType.CATEGORY_GRID) {
    return comp.data.uniqueId;
  }
  return "";
};

const getComponentLabel = (comp: LayoutComponent): string => {
  if (comp.type === $Enums.LayoutComponentType.MARQUEE) {
    return `Marquee`;
  }
  if (comp.type === $Enums.LayoutComponentType.PRODUCT_LIST) {
    return `Ürün Listesi`;
  }
  if (comp.type === $Enums.LayoutComponentType.CATEGORY_GRID) {
    return `Kategori Izgarası`;
  }
  return "Component";
};

const isSliderComponent = (comp: LayoutComponent): comp is SliderComponent => {
  if (!comp) return false;
  return comp.type === $Enums.LayoutComponentType.SLIDER;
};

const isMarqueeComponent = (
  comp: LayoutComponent
): comp is MarqueeComponent => {
  return comp.type === $Enums.LayoutComponentType.MARQUEE;
};

const isProductListComponent = (
  comp: LayoutComponent
): comp is ProductListComponent => {
  return comp.type === $Enums.LayoutComponentType.PRODUCT_LIST;
};

const isCategoryGridComponent = (
  comp: LayoutComponent
): comp is CategoryGridComponent => {
  return comp.type === $Enums.LayoutComponentType.CATEGORY_GRID;
};

// Sortable item component
interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Paper
        withBorder
        p="sm"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <Group align="center" justify="space-between" gap="xs">
          <ActionIcon
            variant="transparent"
            size="sm"
            {...listeners}
            style={{ cursor: "grab" }}
          >
            <IconGripVertical size={16} />
          </ActionIcon>
          {children}
        </Group>
      </Paper>
    </div>
  );
};

const AdminThemeAside = ({
  control,
  data: parentData,
  onSubmit,
  handleSubmit,
  formState,
}: AdminThemeAsideProps) => {
  const [component, setComponent] = useState<ComponentState>("add");
  const [selectedComponentType, setSelectedComponentType] = useState<
    string | null
  >(null);

  const [editingItem, setEditingItem] = useState<
    | {
        type: "slider";
        data: SliderType & { order: number };
      }
    | {
        type: "marquee";
        data: MarqueeType;
      }
    | {
        type: "product_list";
        data: ProductListComponentType;
      }
    | {
        type: "category_grid";
        data: CategoryGridComponentType;
      }
    | null
  >(null);

  const { append, remove, update } = useFieldArray({
    control,
    name: "components",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { sliderComponent, allNonSliderComponents, safeComponents } =
    useMemo(() => {
      const safeComponents = (parentData?.components ||
        []) as LayoutComponent[];

      const sliderComponent = safeComponents.find(isSliderComponent);

      const allNonSliderComponents = safeComponents
        .filter(
          (
            comp
          ): comp is
            | MarqueeComponent
            | ProductListComponent
            | CategoryGridComponent => !isSliderComponent(comp)
        )
        .filter(Boolean)
        .sort((a, b) => a.layoutOrder - b.layoutOrder);

      return {
        sliderComponent,
        allNonSliderComponents,
        safeComponents,
      };
    }, [parentData?.components]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeIndex = allNonSliderComponents.findIndex(
      (comp) => getUniqueId(comp) === active.id
    );

    const overIndex = allNonSliderComponents.findIndex(
      (comp) => getUniqueId(comp) === over.id
    );

    if (activeIndex !== -1 && overIndex !== -1) {
      const reorderedComponents = arrayMove(
        allNonSliderComponents,
        activeIndex,
        overIndex
      );

      reorderedComponents.forEach((comp, index) => {
        const componentIndex = safeComponents.findIndex((c) => {
          const compUniqueId = getUniqueId(comp);
          const cUniqueId = getUniqueId(c);
          return compUniqueId === cUniqueId && comp.type === c.type;
        });

        if (componentIndex !== -1) {
          update(componentIndex, {
            ...comp,
            layoutOrder: index + 2,
          });
        }
      });
    }
  };

  // Slider operations
  const addSliderToComponent = (sliderData: SliderType & { order: number }) => {
    const sliderComponentIndex = safeComponents.findIndex(isSliderComponent);

    if (sliderComponentIndex !== -1 && sliderComponent) {
      const newSliders = [...sliderComponent.data, sliderData];
      update(sliderComponentIndex, {
        type: $Enums.LayoutComponentType.SLIDER,
        layoutOrder: 1 as const,
        data: newSliders,
      });
    } else {
      append({
        type: $Enums.LayoutComponentType.SLIDER,
        layoutOrder: 1,
        data: [sliderData],
      });
    }
  };

  const removeSliderFromComponent = (sliderIndex: number) => {
    const sliderComponentIndex = safeComponents.findIndex(isSliderComponent);

    if (sliderComponentIndex !== -1 && sliderComponent) {
      const newSliders = sliderComponent.data.filter(
        (_, index) => index !== sliderIndex
      );
      update(sliderComponentIndex, {
        type: $Enums.LayoutComponentType.SLIDER,
        layoutOrder: 1 as const,
        data: newSliders,
      });
    }
  };

  const updateSliderInComponent = (
    sliderData: SliderType & { order: number }
  ) => {
    const sliderComponentIndex = safeComponents.findIndex(isSliderComponent);

    if (sliderComponentIndex !== -1 && sliderComponent) {
      const sliderIndex = sliderComponent.data.findIndex(
        (s) => s.uniqueId === sliderData.uniqueId
      );
      if (sliderIndex !== -1) {
        const updatedSliders = [...sliderComponent.data];
        updatedSliders[sliderIndex] = sliderData;
        update(sliderComponentIndex, {
          type: $Enums.LayoutComponentType.SLIDER,
          layoutOrder: 1 as const,
          data: updatedSliders,
        });
      }
    }
  };

  // Marquee operations
  const addMarqueeComponent = (marqueeData: MarqueeType) => {
    const maxLayoutOrder = Math.max(
      ...safeComponents.map((c) => c.layoutOrder),
      1
    );
    append({
      type: $Enums.LayoutComponentType.MARQUEE,
      layoutOrder: maxLayoutOrder + 1,
      data: marqueeData,
    });
  };

  const removeMarqueeComponent = (layoutOrder: number) => {
    const marqueeIndex = safeComponents.findIndex(
      (c): c is MarqueeComponent =>
        isMarqueeComponent(c) && c.layoutOrder === layoutOrder
    );
    if (marqueeIndex !== -1) {
      remove(marqueeIndex);
    }
  };

  const updateMarqueeComponent = (marqueeData: MarqueeType) => {
    const marqueeIndex = safeComponents.findIndex(
      (c): c is MarqueeComponent => {
        return (
          isMarqueeComponent(c) && c.data.uniqueId === marqueeData.uniqueId
        );
      }
    );

    if (marqueeIndex !== -1) {
      const existingComponent = safeComponents[marqueeIndex];
      update(marqueeIndex, {
        type: $Enums.LayoutComponentType.MARQUEE,
        layoutOrder: existingComponent.layoutOrder,
        data: marqueeData,
      });
    }
  };

  // ProductList operations
  const addProductListComponent = (
    productListData: ProductListComponentType
  ) => {
    const maxLayoutOrder = Math.max(
      ...safeComponents.map((c) => c.layoutOrder),
      1
    );
    append({
      type: $Enums.LayoutComponentType.PRODUCT_LIST,
      layoutOrder: maxLayoutOrder + 1,
      data: productListData,
    });
  };

  const removeProductListComponent = (layoutOrder: number) => {
    const productListIndex = safeComponents.findIndex(
      (c): c is ProductListComponent =>
        isProductListComponent(c) && c.layoutOrder === layoutOrder
    );
    if (productListIndex !== -1) {
      remove(productListIndex);
    }
  };

  const updateProductListComponent = (
    productListData: ProductListComponentType
  ) => {
    const productListIndex = safeComponents.findIndex(
      (c): c is ProductListComponent => {
        return (
          isProductListComponent(c) &&
          c.data.uniqueId === productListData.uniqueId
        );
      }
    );
    if (productListIndex !== -1) {
      const existingComponent = safeComponents[productListIndex];
      update(productListIndex, {
        type: $Enums.LayoutComponentType.PRODUCT_LIST,
        layoutOrder: existingComponent.layoutOrder,
        data: productListData,
      });
    }
  };

  // CategoryGrid operations
  const addCategoryGridComponent = (
    categoryGridData: CategoryGridComponentType
  ) => {
    const maxLayoutOrder = Math.max(
      ...safeComponents.filter(Boolean).map((c) => c.layoutOrder),
      1
    );
    append({
      type: $Enums.LayoutComponentType.CATEGORY_GRID,
      layoutOrder: maxLayoutOrder + 1,
      data: categoryGridData,
    });
  };

  const removeCategoryGridComponent = (layoutOrder: number) => {
    const categoryGridIndex = safeComponents.findIndex(
      (c): c is CategoryGridComponent =>
        isCategoryGridComponent(c) && c.layoutOrder === layoutOrder
    );
    if (categoryGridIndex !== -1) {
      remove(categoryGridIndex);
    }
  };

  const updateCategoryGridComponent = (
    categoryGridData: CategoryGridComponentType
  ) => {
    const categoryGridIndex = safeComponents.findIndex(
      (c): c is CategoryGridComponent => {
        return (
          isCategoryGridComponent(c) &&
          c.data.uniqueId === categoryGridData.uniqueId
        );
      }
    );
    if (categoryGridIndex !== -1) {
      const existingComponent = safeComponents[categoryGridIndex];
      update(categoryGridIndex, {
        type: $Enums.LayoutComponentType.CATEGORY_GRID,
        layoutOrder: existingComponent.layoutOrder,
        data: categoryGridData,
      });
    }
  };

  const componentOptions = [
    { value: "slider", label: "Slider Ekle" },
    { value: "marquee", label: "Marquee Ekle" },
    { value: "product_list", label: "Ürün Listesi Ekle" },
    { value: "category_grid", label: "Kategori Izgarası Ekle" },
  ];

  const handleComponentSelect = (value: string | null) => {
    if (value) {
      setSelectedComponentType(value);
      setComponent(value as ComponentState);
      setEditingItem(null);
    }
  };

  const handleEditSlider = (sliderData: SliderType & { order: number }) => {
    if (!sliderData) return;
    setEditingItem({ type: "slider", data: sliderData });
    setComponent("edit");
    setSelectedComponentType(null);
  };

  const handleEditMarquee = (marqueeData: MarqueeType) => {
    setEditingItem({ type: "marquee", data: marqueeData });
    setComponent("edit");
    setSelectedComponentType(null);
  };

  const handleEditProductList = (productListData: ProductListComponentType) => {
    setEditingItem({ type: "product_list", data: productListData });
    setComponent("edit");
    setSelectedComponentType(null);
  };

  const handleEditCategoryGrid = (
    categoryGridData: CategoryGridComponentType
  ) => {
    setEditingItem({ type: "category_grid", data: categoryGridData });
    setComponent("edit");
    setSelectedComponentType(null);
  };

  const handleFormSubmit = (
    data:
      | SliderType
      | MarqueeType
      | ProductListComponentType
      | CategoryGridComponentType
  ) => {
    if (component === "edit" && editingItem) {
      if (editingItem.type === "slider") {
        updateSliderInComponent({
          ...(data as SliderType),
          order: editingItem.data.order,
        });
      } else if (editingItem.type === "marquee") {
        updateMarqueeComponent(data as MarqueeType);
      } else if (editingItem.type === "product_list") {
        updateProductListComponent(data as ProductListComponentType);
      } else if (editingItem.type === "category_grid") {
        updateCategoryGridComponent(data as CategoryGridComponentType);
      }
    } else {
      if (component === "slider") {
        const lastOrder = Math.max(
          ...(sliderComponent?.data.map((s) => s.order) || [0]),
          0
        );
        addSliderToComponent({
          ...(data as SliderType),
          order: lastOrder + 1,
        });
      } else if (component === "marquee") {
        addMarqueeComponent(data as MarqueeType);
      } else if (component === "product_list") {
        addProductListComponent(data as ProductListComponentType);
      } else if (component === "category_grid") {
        addCategoryGridComponent(data as CategoryGridComponentType);
      }
    }
    setComponent("add");
    setSelectedComponentType(null);
    setEditingItem(null);
  };

  return (
    <Stack gap="md">
      {component === "add" && (
        <>
          <Group justify="flex-end" align="center" gap={"xs"}>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={
                !formState.isValid ||
                formState.isSubmitting ||
                formState.isDirty === false
              }
            >
              Kaydet
            </Button>
          </Group>
          <Select
            placeholder="Component türü seçin"
            data={componentOptions}
            value={selectedComponentType}
            onChange={handleComponentSelect}
            clearable
          />
          <Controller
            control={control}
            name="primaryColor"
            render={({ field: { onChange, ...field } }) => (
              <ColorInput
                {...field}
                onChangeEnd={onChange}
                label="Primary Renk"
              />
            )}
          />
          <Controller
            control={control}
            name="secondaryColor"
            render={({ field: { onChange, ...field } }) => (
              <ColorInput
                {...field}
                onChangeEnd={onChange}
                label="Secondary Renk"
              />
            )}
          />
          <Controller
            control={control}
            name="fontFamily"
            render={({ field }) => (
              <Select
                {...field}
                label="Uygulama Fontu"
                allowDeselect={false}
                data={Object.values(FontFamily).map((data) => ({
                  value: data,
                  label: getFontFamilyLabel(data),
                }))}
              />
            )}
          />
        </>
      )}

      {component !== "add" && (
        <Button
          variant="light"
          onClick={() => {
            setComponent("add");
            setSelectedComponentType(null);
            setEditingItem(null);
          }}
          leftSection="←"
          fullWidth
        >
          Geri Dön
        </Button>
      )}

      {component === "add" && (
        <>
          {sliderComponent && (
            <Paper withBorder p="sm" style={{ backgroundColor: "#f8f9fa" }}>
              <Text fw={600} size="sm" mb="xs">
                Slider (Sabit Pozisyon)
              </Text>
              <Stack gap="xs">
                {sliderComponent.data.map((slider, index) => (
                  <Group
                    key={slider.uniqueId}
                    justify="space-between"
                    align="center"
                  >
                    <Text size="sm">Slider {slider.order}</Text>
                    <Group gap="xs">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => handleEditSlider(slider)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => removeSliderFromComponent(index)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </Paper>
          )}

          {allNonSliderComponents.length > 0 && (
            <Stack gap="xs">
              <Text fw={600} size="sm">
                Componentler
              </Text>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={allNonSliderComponents
                    .map((comp) => getUniqueId(comp))
                    .filter(Boolean)}
                  strategy={verticalListSortingStrategy}
                >
                  {allNonSliderComponents.map((comp) => (
                    <SortableItem
                      key={getUniqueId(comp)}
                      id={getUniqueId(comp)}
                    >
                      <Text size="sm">{getComponentLabel(comp)}</Text>
                      <Group gap="xs">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          onClick={() => {
                            if (isMarqueeComponent(comp)) {
                              handleEditMarquee(comp.data);
                            } else if (isProductListComponent(comp)) {
                              handleEditProductList(comp.data);
                            } else if (isCategoryGridComponent(comp)) {
                              handleEditCategoryGrid(comp.data);
                            }
                          }}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() => {
                            if (isMarqueeComponent(comp)) {
                              removeMarqueeComponent(comp.layoutOrder);
                            } else if (isProductListComponent(comp)) {
                              removeProductListComponent(comp.layoutOrder);
                            } else if (isCategoryGridComponent(comp)) {
                              removeCategoryGridComponent(comp.layoutOrder);
                            }
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>
            </Stack>
          )}
        </>
      )}

      {(component === "slider" ||
        (component === "edit" && editingItem?.type === "slider")) && (
        <SliderForm
          onSubmit={handleFormSubmit}
          defaultValues={
            editingItem?.type === "slider" ? editingItem.data : undefined
          }
        />
      )}

      {(component === "marquee" ||
        (component === "edit" && editingItem?.type === "marquee")) && (
        <MarqueeForm
          onSubmit={handleFormSubmit}
          defaultValues={
            editingItem?.type === "marquee" ? editingItem.data : undefined
          }
        />
      )}

      {(component === "product_list" ||
        (component === "edit" && editingItem?.type === "product_list")) && (
        <ProductListForm
          onSubmit={handleFormSubmit}
          defaultValues={
            editingItem?.type === "product_list" ? editingItem.data : undefined
          }
        />
      )}

      {(component === "category_grid" ||
        (component === "edit" && editingItem?.type === "category_grid")) && (
        <CategoryGridForm
          onSubmit={handleFormSubmit}
          defaultValues={
            editingItem?.type === "category_grid" ? editingItem.data : undefined
          }
        />
      )}
    </Stack>
  );
};

export default AdminThemeAside;
