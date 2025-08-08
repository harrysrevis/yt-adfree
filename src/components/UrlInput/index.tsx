import { ClipboardEventHandler, ComponentProps, forwardRef } from "react"
import { Field, Input, InputGroup } from "@chakra-ui/react"
import { LuLink } from "react-icons/lu"

type UrlInputProps = Omit<ComponentProps<typeof Input>, "size"> & {
  error?: string
  onPaste?: ClipboardEventHandler<HTMLInputElement>
  placeholder?: string
}

const UrlInput = forwardRef<HTMLInputElement, UrlInputProps>(
  (
    { error, placeholder = "Paste the YouTube link here", onPaste, ...rest },
    ref
  ) => {
    return (
      <Field.Root invalid={!!error}>
        <InputGroup
          startElementProps={{
            padding: 3
          }}
          startElement={<LuLink />}
        >
          <Input
            ref={ref}
            onPaste={onPaste}
            placeholder={placeholder}
            borderRadius="full"
            border="none"
            size="lg"
            bg="whiteAlpha.200"
            _hover={{ bg: "whiteAlpha.300" }}
            _focusVisible={{
              bg: "whiteAlpha.300",
              boxShadow: "0 0 0 2px rgba(255,255,255,.35)"
            }}
            backdropFilter="blur(6px)"
            color="whiteAlpha.900"
            _placeholder={{ color: "whiteAlpha.700" }}
            {...rest}
          />
        </InputGroup>
        {error ? (
          <Field.ErrorText mt="1" color="red.300" fontSize="sm">
            {error}
          </Field.ErrorText>
        ) : null}
      </Field.Root>
    )
  }
)

UrlInput.displayName = "UrlInput"
export default UrlInput
