import { selectCaptchaUrl, selectThemeMode, setAppErrorAC, setCaptchaUrlAC, setIsLoggedInAC } from "@/app/app-slice"
import { AUTH_TOKEN } from "@/common/constants"
import { ResultCode } from "@/common/enums"
import { useAppDispatch, useAppSelector } from "@/common/hooks"
import { getTheme } from "@/common/theme"
import { useGetCaptchaQuery, useLoginMutation } from "@/features/auth/api/authApi"
import { type LoginInputs, loginSchema } from "@/features/auth/lib/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import FormLabel from "@mui/material/FormLabel"
import Grid from "@mui/material/Grid"
import TextField from "@mui/material/TextField"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import styles from "./Login.module.css"
import { useEffect } from "react"

export const Login = () => {
  const themeMode = useAppSelector(selectThemeMode)
  const captchaUrl = useAppSelector(selectCaptchaUrl)

  const [login, { data }] = useLoginMutation()
  const { data: captchaData } = useGetCaptchaQuery()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (data?.resultCode === ResultCode.CaptchaError) {
      dispatch(setCaptchaUrlAC({ url: captchaData ? captchaData.url : null }))

      if (data.messages) {
        dispatch(setAppErrorAC({ error: data.messages[0] }))
      }
    } else {
      dispatch(setCaptchaUrlAC({ url: null }))
    }
  }, [data])

  const theme = getTheme(themeMode)

  const {
    register,
    handleSubmit,
    reset,
    control,
    resetField,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false, captcha: null },
  })

  const onSubmit: SubmitHandler<LoginInputs> = (data) => {
    resetField("captcha")

    login(data).then((res) => {
      if (res.data?.resultCode === ResultCode.Success) {
        dispatch(setIsLoggedInAC({ isLoggedIn: true }))
        try {
          localStorage.setItem(AUTH_TOKEN, JSON.stringify(res.data.data.token))
        } catch (e) {
          console.error("Failed to save token to localStorage", e)
        }
        reset()
      }
    })
  }

  return (
    <Grid container justifyContent={"center"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl>
          <FormLabel>
            <p>
              To login get registered
              <a
                style={{ color: theme.palette.primary.main, marginLeft: "5px" }}
                href="https://social-network.samuraijs.com"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
            </p>
            <p>or use common test account credentials:</p>
            <p>
              <b>Email:</b> free@samuraijs.com
            </p>
            <p>
              <b>Password:</b> free
            </p>
          </FormLabel>
          <FormGroup>
            <TextField label="Email" margin="normal" error={!!errors.email} {...register("email")} />
            {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
            <TextField
              type="password"
              label="Password"
              margin="normal"
              error={!!errors.email}
              {...register("password")}
            />
            {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}
            <FormControlLabel
              label={"Remember me"}
              control={
                <Controller
                  name={"rememberMe"}
                  control={control}
                  render={({ field: { value, ...field } }) => <Checkbox {...field} checked={value} />}
                />
              }
            />
            {captchaUrl && (
              <>
                <img src={captchaData?.url} alt="Captcha" />
                <TextField {...register("captcha")} />
              </>
            )}
            <Button type="submit" variant="contained" color="primary">
              Login
            </Button>
          </FormGroup>
        </FormControl>
      </form>
    </Grid>
  )
}
