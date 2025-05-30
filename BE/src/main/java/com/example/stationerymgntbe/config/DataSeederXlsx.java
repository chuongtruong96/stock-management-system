package com.example.stationerymgntbe.config;

import com.example.stationerymgntbe.entity.*;
import com.example.stationerymgntbe.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.text.Normalizer;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Profile("dev")
@Configuration
@RequiredArgsConstructor
public class DataSeederXlsx {

    private final ProductRepository productRepo;
    private final UnitRepository unitRepo;
    private final CategoryRepository categoryRepo;

    /* ────────── 1. Category gốc ────────── */
    private static final List<Category> PRESET = List.of(
            new Category(null, "Băng keo & Keo dán", "Adhesives & Tapes", "ADHESIVE", null),
            new Category(null, "Bao thư & Phong bì", "Envelopes", "ENVELOPE", null),
            new Category(null, "Bìa / File / Trang ký", "Files & Folders", "FILE", null),
            new Category(null, "Bút bi & Bút mực", "Ball-point & Gel", "PEN", null),
            new Category(null, "Bút viết bảng", "Whiteboard Mkrs", "WHITEBOARD", null),
            new Category(null, "Bút chì & Ruột chì", "Pencils & Leads", "PENCIL", null),
            new Category(null, "Bút dạ quang / Marker", "Highlighters", "HIGHLIGHTER", null),
            new Category(null, "Gôm / Xoá / Correction", "Erasers & Corr.", "CORRECTION", null),
            new Category(null, "Cắt, Dao, Kéo & Lỗ đục", "Cutting & Punch.", "CUTTING", null),
            new Category(null, "Kẹp, Kim, Ghim & Bấm", "Clips & Staplers", "CLIP", null),
            new Category(null, "Giấy ghi chú & Nhãn dán", "Sticky Notes", "STICKY_NOTE", null),
            new Category(null, "Sổ / Tập / Notebook", "Notebooks", "NOTEBOOK", null),
            new Category(null, "Giấy in & Tiêu đề", "Printing Paper", "PRINT_PAPER", null),
            new Category(null, "Dụng cụ đo & Thước", "Rulers", "RULER", null),
            new Category(null, "Khác", "Miscellaneous", "MISC", null));

    /* ────────── 2. Keyword ↔ nhóm ────────── */
    private static final Map<String, String> KW = Map.ofEntries(
            Map.entry("băng keo", "ADHESIVE"), Map.entry("keo ", "ADHESIVE"), Map.entry("stick-tack", "ADHESIVE"),
            Map.entry("bao thư", "ENVELOPE"),
            Map.entry("bìa", "FILE"), Map.entry("file", "FILE"), Map.entry("folder", "FILE"), Map.entry("mika", "FILE"),
            Map.entry("bút bi", "PEN"), Map.entry(" pen ", "PEN"), Map.entry("bút bảng", "WHITEBOARD"),
            Map.entry("bút chì", "PENCIL"), Map.entry("ruột chì", "PENCIL"),
            Map.entry("dạ quang", "HIGHLIGHTER"), Map.entry("marker", "HIGHLIGHTER"),
            Map.entry("lông dầu", "HIGHLIGHTER"),
            Map.entry("gôm", "CORRECTION"), Map.entry("xóa", "CORRECTION"), Map.entry("eraser", "CORRECTION"),
            Map.entry("dao ", "CUTTING"), Map.entry("kéo ", "CUTTING"), Map.entry("đục lỗ", "CUTTING"),
            Map.entry("kẹp ", "CLIP"), Map.entry("ghim", "CLIP"), Map.entry("kim bấm", "CLIP"),
            Map.entry("bấm", "CLIP"), Map.entry("gỡ kim", "CLIP"),
            Map.entry("giấy ghi chú", "STICKY_NOTE"), Map.entry("tem dán", "STICKY_NOTE"),
            Map.entry("decal", "STICKY_NOTE"),
            Map.entry("sổ ", "NOTEBOOK"), Map.entry("tập ", "NOTEBOOK"), Map.entry("notebook", "NOTEBOOK"),
            Map.entry("workbook", "NOTEBOOK"),
            Map.entry("70gsm", "PRINT_PAPER"), Map.entry("80gms", "PRINT_PAPER"), Map.entry("giấy in", "PRINT_PAPER"),
            Map.entry("tiêu đề", "PRINT_PAPER"),
            Map.entry("thước", "RULER"));

    /* ────────── 3. Alias ĐVT ────────── */
    private static final Map<String, String> UNIT_ALIAS = Map.ofEntries(
            Map.entry("cục", "cái"),
            Map.entry("viên/vĩ", "vĩ"), Map.entry("viên/vĩ", "vĩ"), Map.entry("viên", "vĩ"),
            Map.entry("vĩ", "vĩ"),
            Map.entry("bịch", "bịch"));
    private static final boolean USE_ALIAS = true;

    /* ────────── helper ────────── */
    private static String nfc(String s) {
        return Normalizer.normalize(
                s.replace('\u00A0', ' ')
                        .replaceAll("[\\t\\r\\n]", "")
                        .trim().toLowerCase(),
                Normalizer.Form.NFC);
    }

    private static String cell(Row r, int i) {
        Cell c = r.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
        c.setCellType(CellType.STRING); // ⚠️ deprecated → chấp nhận
        return c.getStringCellValue().trim();
    }

    private String group(String vi) {
        String k = nfc(vi);
        return KW.entrySet().stream()
                .filter(e -> k.contains(e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst().orElse("MISC");
    }

    /* ────────── 4. SEEDER ────────── */
    @Bean
    @Transactional
    CommandLineRunner seedAll() {
        return args -> {

            /* 4-1 Category */
            PRESET.forEach(c -> categoryRepo.findByCodeIgnoreCase(c.getCode())
                    .orElseGet(() -> categoryRepo.save(c)));

            /* 4-2 Unit gốc (up-sert) */
            Map<String, String> UNITS = Map.ofEntries(
                    Map.entry("cây", "piece"), Map.entry("cuộn", "roll"),
                    Map.entry("xấp", "pack"), Map.entry("hộp", "box"),
                    Map.entry("cái", "item"), Map.entry("bộ", "set"),
                    Map.entry("chai", "bottle"), Map.entry("bao", "bag"),
                    Map.entry("ream", "ream"), Map.entry("vĩ", "card"),
                    Map.entry("cặp", "pair"), Map.entry("ống", "tube"),
                    Map.entry("cục", "block"), Map.entry("cuốn", "book"),
                    Map.entry("bịch", "bag"));
            UNITS.forEach((vn, en) -> {
                String vnN = Normalizer.normalize(vn, Normalizer.Form.NFC);
                unitRepo.findByNameVnIgnoreCase(vnN)
                        .or(() -> unitRepo.findByNameEnIgnoreCase(en))
                        .orElseGet(() -> unitRepo.save(new Unit(null, vnN, en)));
            });

            /* 4-3 Nạp Excel */
            try (Workbook wb = WorkbookFactory.create(
                    Objects.requireNonNull(getClass().getResourceAsStream("/VPPham.xlsx")))) {

                Sheet sh = wb.getSheetAt(0);
                boolean header = true;
                AtomicInteger ins = new AtomicInteger();
                AtomicInteger upd = new AtomicInteger();

                for (Row r : sh) {
                    if (header) {
                        header = false;
                        continue;
                    }

                    String code = cell(r, 1);
                    if (code.isBlank())
                        continue;

                    String nameVi = cell(r, 2);

                    /* ĐVT */
                    String raw = nfc(cell(r, 4))
                            .replaceFirst("^\\d+\\s*", "")
                            .replaceFirst("^\\d+/\\d+\\s*", "");
                    final String unitKey = USE_ALIAS ? UNIT_ALIAS.getOrDefault(raw, raw) : raw;

                    Unit unit = unitRepo.findByNameVnIgnoreCase(unitKey)
                            .orElseGet(() -> unitRepo.save(new Unit(null, unitKey, unitKey)));

                    Category cat = categoryRepo.findByCodeIgnoreCase(group(nameVi)).orElseThrow();

                    productRepo.findByCode(code).ifPresentOrElse(p -> {
                        boolean changed = false;
                        if (!p.getName().equals(nameVi)) {
                            p.setName(nameVi);
                            changed = true;
                        }
                        if (!p.getUnit().equals(unit)) {
                            p.setUnit(unit);
                            changed = true;
                        }
                        if (!p.getCategory().equals(cat)) {
                            p.setCategory(cat);
                            changed = true;
                        }
                        if (changed) {
                            productRepo.save(p);
                            upd.incrementAndGet();
                        }
                    }, () -> {
                        productRepo.save(Product.builder()
                                .code(code).name(nameVi)
                                .image(null)
                                .unit(unit).category(cat).build());
                        ins.incrementAndGet();
                    });
                }
                System.out.printf("✅ Excel seeding — inserted: %d, updated: %d%n",
                        ins.get(), upd.get());
            }
        };
    }
}
